import { buildAgentRegistry, buildWorkflowRegistry } from "./agent-loader";
import { callLLMSync } from "./llm-caller";
import type { DispatchResult, ExecutionStep, LLMConfig } from "./types";

let cachedRegistry: string | null = null;
let cachedWorkflows: string | null = null;

/**
 * The Dispatcher analyzes a user message and returns an execution plan.
 * It makes ONE small LLM call with just the agent registry (~3K tokens),
 * NOT the full agent brain (which is 50K+).
 */
export async function dispatch(
  userMessage: string,
  conversationHistory: { role: string; content: string }[],
  llmConfig: LLMConfig,
  contentRoot: string,
  clientContext?: string
): Promise<DispatchResult> {
  // Build registry on first call, cache it
  if (!cachedRegistry) cachedRegistry = buildAgentRegistry(contentRoot);
  if (!cachedWorkflows) cachedWorkflows = buildWorkflowRegistry(contentRoot);

  const systemPrompt = `You are the AGEX dispatcher. Analyze the user's request and decide which agent(s) to deploy.

## Available Agents
${cachedRegistry}

## Available Workflows
${cachedWorkflows}

## Instructions
Analyze the user's message. Return a JSON object with your execution plan.

If the user is making general conversation (greetings, questions about AGEX, etc.), return type "conversation".
If the user needs ONE agent (e.g., "write a blog post"), return type "single-agent".
If the user needs MULTIPLE agents in sequence (e.g., "create a full strategy"), return type "multi-agent".
If the user mentions a specific workflow name, return type "workflow".

${clientContext ? `## Active Client Context\n${clientContext}\n` : ""}

## Response Format
Respond ONLY with valid JSON, no other text:
{
  "type": "single-agent" | "multi-agent" | "workflow" | "conversation",
  "reasoning": "brief explanation of your routing decision",
  "plan": [
    {
      "stepIndex": 0,
      "agentSlug": "blog-writer",
      "agentFile": "agents/content/blog-writer.md",
      "teamSlug": "content",
      "instruction": "what this agent should do",
      "dependsOn": [],
      "saveTo": { "vault": "vault/05-Content/...", "output": "output/..." }
    }
  ]
}

For "conversation" type, return an empty plan: []`;

  const lastMessages = conversationHistory.slice(-6);
  lastMessages.push({ role: "user", content: userMessage });

  try {
    const { content } = await callLLMSync(llmConfig, systemPrompt, lastMessages);

    // Extract JSON from response (LLM might wrap it in markdown code blocks)
    const jsonStr = content.match(/\{[\s\S]*\}/)?.[0];
    if (!jsonStr) {
      // Failed to get JSON — fall back to conversation mode
      return {
        type: "conversation",
        plan: [],
        reasoning: "Could not parse dispatcher response, falling back to conversation",
      };
    }

    const parsed = JSON.parse(jsonStr) as DispatchResult;

    // Validate the plan
    if (!parsed.type) parsed.type = "conversation";
    if (!Array.isArray(parsed.plan)) parsed.plan = [];
    if (!parsed.reasoning) parsed.reasoning = "";

    return parsed;
  } catch (err) {
    // On any error, fall back to conversation mode (v1 behavior)
    return {
      type: "conversation",
      plan: [],
      reasoning: `Dispatcher error: ${(err as Error).message}. Falling back to conversation.`,
    };
  }
}

/**
 * Check if a message is likely just conversation (no agent needed).
 * Fast check before calling the LLM dispatcher.
 */
export function isLikelyConversation(message: string): boolean {
  const lower = message.toLowerCase().trim();
  const conversational = [
    /^(hi|hello|hey|yo|sup|howdy|hola)\b/,
    /^(thanks|thank you|thx)/,
    /^(what can you|what do you|who are you|what are you)/,
    /^(how does|how do i|can you help)/,
    /^(yes|no|ok|okay|sure|got it|cool)\b/,
  ];
  return conversational.some((r) => r.test(lower));
}
