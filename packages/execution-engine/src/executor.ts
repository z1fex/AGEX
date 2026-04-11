import path from "node:path";
import { loadAgentPrompt } from "./agent-loader";
import { callLLM, parseStream, callLLMSync } from "./llm-caller";
import { saveOutput } from "./output-saver";
import { recordCost } from "./cost-tracker";
import type {
  DispatchResult,
  ExecutionStep,
  StepResult,
  LLMConfig,
  StreamEvent,
} from "./types";

/**
 * Execute a dispatch plan. Handles both single-agent and multi-agent chains.
 *
 * For single-agent: makes one focused LLM call with just that agent's prompt.
 * For multi-agent: chains calls sequentially, passing output between steps.
 *
 * The onEvent callback streams SSE events back to the client.
 */
export async function executePlan(
  plan: DispatchResult,
  llmConfig: LLMConfig,
  contentRoot: string,
  onEvent: (event: StreamEvent) => void,
  options?: {
    clientContext?: string;
    clientSlug?: string;
    conversationHistory?: { role: string; content: string }[];
    vaultRoot?: string;
    outputRoot?: string;
    dataDir?: string;
  }
): Promise<void> {
  const startTime = Date.now();
  let totalCost = 0;
  let totalTokens = 0;
  const stepOutputs: Map<number, string> = new Map();

  // For conversation type, fall back to the compact brain (v1 behavior)
  if (plan.type === "conversation") {
    await executeConversation(llmConfig, contentRoot, onEvent, options);
    return;
  }

  // Execute each step in the plan
  for (const step of plan.plan) {
    const stepStart = Date.now();

    // Emit step_start
    onEvent({
      event: "step_start",
      data: { stepIndex: step.stepIndex, agent: step.agentSlug, team: step.teamSlug },
    });

    // Collect outputs from dependent steps
    let priorOutputs = "";
    for (const depIdx of step.dependsOn) {
      const depOutput = stepOutputs.get(depIdx);
      if (depOutput) {
        priorOutputs += `\n--- Output from step ${depIdx} ---\n${depOutput.slice(0, 2000)}\n`;
      }
    }

    // Load this agent's focused prompt
    const systemPrompt = loadAgentPrompt(step.agentFile, contentRoot, {
      clientContext: options?.clientContext,
      priorStepOutputs: priorOutputs || undefined,
      taskInstruction: step.instruction,
    });

    // Make the LLM call
    try {
      const rawStream = await callLLM(llmConfig, systemPrompt, [
        { role: "user", content: step.instruction },
      ]);

      const { stream, usage } = parseStream(llmConfig.provider, rawStream);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      // Stream tokens to client
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        fullContent += text;
        onEvent({ event: "token", data: { text } });
      }

      const { promptTokens, completionTokens } = await usage;
      const stepDuration = Date.now() - stepStart;
      const stepCost = estimateCost(llmConfig.model, promptTokens, completionTokens);

      totalCost += stepCost;
      totalTokens += promptTokens + completionTokens;
      stepOutputs.set(step.stepIndex, fullContent);

      // Emit step_complete
      onEvent({
        event: "step_complete",
        data: {
          stepIndex: step.stepIndex,
          agent: step.agentSlug,
          tokens: promptTokens + completionTokens,
          cost: stepCost,
          durationMs: stepDuration,
        },
      });

      // Record cost event
      if (options?.dataDir) {
        try {
          recordCost(options.dataDir, {
            agent: step.agentSlug,
            team: step.teamSlug,
            provider: llmConfig.provider,
            model: llmConfig.model,
            promptTokens,
            completionTokens,
            costUsd: stepCost,
            durationMs: stepDuration,
            clientSlug: options.clientSlug,
          });
        } catch {}
      }

      // Save output to vault + output directory
      if (fullContent.trim() && options?.vaultRoot && options?.outputRoot) {
        try {
          const saved = saveOutput(fullContent, {
            agentSlug: step.agentSlug,
            teamSlug: step.teamSlug,
            clientSlug: options.clientSlug,
            vaultRoot: options.vaultRoot,
            outputRoot: options.outputRoot,
          });
          onEvent({ event: "output_saved", data: { path: saved.vaultPath } });
        } catch (saveErr) {
          // Don't fail the whole execution if saving fails
          console.warn("Failed to save output:", saveErr);
        }
      }
    } catch (err) {
      onEvent({
        event: "error",
        data: { message: `Agent ${step.agentSlug} failed: ${(err as Error).message}` },
      });
    }
  }

  // Done
  onEvent({
    event: "done",
    data: {
      totalCost,
      totalTokens,
      totalDurationMs: Date.now() - startTime,
    },
  });
}

/**
 * Conversation mode — uses compact brain (v1 behavior).
 * For general chat that doesn't need a specific agent.
 */
async function executeConversation(
  llmConfig: LLMConfig,
  contentRoot: string,
  onEvent: (event: StreamEvent) => void,
  options?: {
    clientContext?: string;
    conversationHistory?: { role: string; content: string }[];
  }
): Promise<void> {
  // Use the v1 compact brain for conversation
  const { buildCompactBrainForConversation } = await import("./conversation-brain");
  const brain = buildCompactBrainForConversation(contentRoot);

  const messages = options?.conversationHistory || [];
  const rawStream = await callLLM(llmConfig, brain, messages);
  const { stream } = parseStream(llmConfig.provider, rawStream);

  const reader = stream.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    onEvent({ event: "token", data: { text } });
  }

  onEvent({ event: "done", data: { totalCost: 0, totalTokens: 0, totalDurationMs: 0 } });
}

/**
 * Estimate cost based on model and token counts.
 */
function estimateCost(model: string, promptTokens: number, completionTokens: number): number {
  // Pricing per million tokens
  const pricing: Record<string, { input: number; output: number }> = {
    "gpt-4o": { input: 2.5, output: 10 },
    "gpt-4o-mini": { input: 0.15, output: 0.6 },
    "o3-mini": { input: 1.1, output: 4.4 },
    "claude-sonnet-4-20250514": { input: 3, output: 15 },
    "claude-haiku-4-5-20251001": { input: 0.8, output: 4 },
    "claude-opus-4-20250514": { input: 15, output: 75 },
    "gemini-2.5-pro": { input: 1.25, output: 5 },
    "gemini-2.5-flash": { input: 0.075, output: 0.3 },
    "llama-3.3-70b-versatile": { input: 0, output: 0 },
    "llama-3.1-8b-instant": { input: 0, output: 0 },
    "mixtral-8x7b-32768": { input: 0, output: 0 },
  };

  const p = pricing[model] || { input: 1, output: 3 }; // default fallback
  return (promptTokens * p.input + completionTokens * p.output) / 1_000_000;
}
