import { NextRequest } from "next/server";
import path from "node:path";
import {
  dispatch,
  isLikelyConversation,
  executePlan,
  buildCompactBrainForConversation,
  buildClientContext,
  callLLM,
  parseStream,
  type LLMConfig,
  type StreamEvent,
} from "@agency/execution-engine";

const CONTENT_ROOT = path.resolve(process.cwd(), "../../content");
const VAULT_ROOT = path.resolve(process.cwd(), "../../vault");
const OUTPUT_ROOT = path.resolve(process.cwd(), "../../output");
const DATA_DIR = path.resolve(process.cwd(), "../../data");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, provider, apiKey, model, baseUrl, clientSlug } = body as {
      messages: { role: string; content: string }[];
      provider: string;
      apiKey: string;
      model: string;
      baseUrl?: string;
      clientSlug?: string;
    };

    // Build client context if a client is associated
    const clientCtx = clientSlug
      ? buildClientContext(clientSlug, VAULT_ROOT)
      : null;

    if (!provider || !model) {
      return new Response(
        JSON.stringify({ error: "Provider and model are required. Go to Settings to configure." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!apiKey && provider !== "ollama") {
      return new Response(
        JSON.stringify({ error: `No API key for ${provider}. Go to Settings to add one.` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const llmConfig: LLMConfig = { provider, apiKey, model, baseUrl };
    const userMessage = messages[messages.length - 1]?.content || "";

    // Fast path: if it's clearly just conversation, skip the dispatcher
    if (isLikelyConversation(userMessage)) {
      return streamConversation(llmConfig, messages);
    }

    // Call the dispatcher to determine which agents to use
    let dispatchResult;
    try {
      dispatchResult = await dispatch(
        userMessage,
        messages.slice(0, -1),
        llmConfig,
        CONTENT_ROOT,
        clientCtx?.summary
      );
    } catch {
      // If dispatcher fails, fall back to conversation mode
      return streamConversation(llmConfig, messages);
    }

    // If dispatcher says it's just conversation, use the compact brain
    if (dispatchResult.type === "conversation" || dispatchResult.plan.length === 0) {
      return streamConversation(llmConfig, messages);
    }

    // Execute the plan with SSE streaming
    return streamExecution(dispatchResult, llmConfig, messages, clientCtx?.summary, clientSlug);
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "LLM call failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Stream a conversation response (no specific agent — compact brain).
 * This is the v1 behavior for general chat.
 */
function streamConversation(
  config: LLMConfig,
  messages: { role: string; content: string }[]
): Response {
  const brain = buildCompactBrainForConversation(CONTENT_ROOT);

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const rawStream = await callLLM(config, brain, messages);
        const { stream } = parseStream(config.provider, rawStream);
        const reader = stream.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } catch (err) {
        controller.enqueue(
          new TextEncoder().encode(`\n\n**Error:** ${(err as Error).message}`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

/**
 * Stream an execution plan (dispatcher found specific agents to run).
 * Each step streams tokens, then moves to the next agent.
 */
function streamExecution(
  plan: Awaited<ReturnType<typeof dispatch>>,
  config: LLMConfig,
  messages: { role: string; content: string }[],
  clientContext?: string,
  clientSlug?: string
): Response {
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        // Stream a header showing the plan
        const planHeader =
          `**AGEX** — deploying ${plan.plan.length} agent${plan.plan.length > 1 ? "s" : ""}:\n` +
          plan.plan.map((s) => `- **${s.agentSlug}** (${s.teamSlug})`).join("\n") +
          "\n\n---\n\n";
        controller.enqueue(encoder.encode(planHeader));

        // Execute the plan
        await executePlan(plan, config, CONTENT_ROOT, (event: StreamEvent) => {
          switch (event.event) {
            case "step_start":
              controller.enqueue(
                encoder.encode(`\n### ${event.data.agent} (${event.data.team})\n\n`)
              );
              break;
            case "token":
              controller.enqueue(encoder.encode(event.data.text));
              break;
            case "step_complete":
              controller.enqueue(
                encoder.encode(
                  `\n\n*— ${event.data.agent} complete (${event.data.tokens} tokens, $${event.data.cost.toFixed(4)})*\n\n---\n\n`
                )
              );
              break;
            case "output_saved":
              controller.enqueue(
                encoder.encode(`\n*Saved to vault: \`${event.data.path}\`*\n`)
              );
              break;
            case "error":
              controller.enqueue(
                encoder.encode(`\n\n**Error:** ${event.data.message}\n\n`)
              );
              break;
            case "done":
              if (event.data.totalCost > 0) {
                controller.enqueue(
                  encoder.encode(
                    `\n*Total: ${event.data.totalTokens} tokens, $${event.data.totalCost.toFixed(4)}, ${(event.data.totalDurationMs / 1000).toFixed(1)}s*`
                  )
                );
              }
              break;
          }
        }, {
          conversationHistory: messages,
          clientContext: clientContext,
          clientSlug: clientSlug,
          vaultRoot: VAULT_ROOT,
          outputRoot: OUTPUT_ROOT,
          dataDir: DATA_DIR,
        });
      } catch (err) {
        controller.enqueue(
          encoder.encode(`\n\n**Error:** ${(err as Error).message}`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
