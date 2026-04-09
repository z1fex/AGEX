import type { LLMConfig } from "./types";

/**
 * Call an LLM provider and return the raw SSE stream.
 * Supports: OpenAI, Anthropic, Google, Groq, OpenRouter, Ollama.
 */
export async function callLLM(
  config: LLMConfig,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<ReadableStream> {
  const { provider, apiKey, model, baseUrl } = config;

  switch (provider) {
    case "openai":
      return callOpenAICompatible(apiKey, model, systemPrompt, messages, "https://api.openai.com/v1");
    case "groq":
      return callOpenAICompatible(apiKey, model, systemPrompt, messages, "https://api.groq.com/openai/v1");
    case "openrouter":
      return callOpenAICompatible(apiKey, model, systemPrompt, messages, "https://openrouter.ai/api/v1");
    case "ollama":
      return callOpenAICompatible("ollama", model, systemPrompt, messages, baseUrl || "http://localhost:11434/v1");
    case "anthropic":
      return callAnthropic(apiKey, model, systemPrompt, messages);
    case "google":
      return callGoogle(apiKey, model, systemPrompt, messages);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

/**
 * OpenAI-compatible API (works with OpenAI, Groq, OpenRouter, Ollama).
 */
async function callOpenAICompatible(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[],
  baseUrl: string
): Promise<ReadableStream> {
  const fullMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, messages: fullMessages, stream: true, max_tokens: 8192 }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${baseUrl} error (${res.status}): ${err}`);
  }
  return res.body!;
}

/**
 * Anthropic Messages API.
 */
async function callAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<ReadableStream> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      system: systemPrompt,
      messages: messages.filter((m) => m.role !== "system"),
      stream: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic error (${res.status}): ${err}`);
  }
  return res.body!;
}

/**
 * Google Gemini API.
 */
async function callGoogle(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<ReadableStream> {
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google error (${res.status}): ${err}`);
  }
  return res.body!;
}

/**
 * Parse provider-specific SSE streams into plain text.
 * Returns { stream, onComplete } — stream is text chunks, onComplete resolves with usage data.
 */
export function parseStream(
  provider: string,
  rawStream: ReadableStream
): {
  stream: ReadableStream<Uint8Array>;
  usage: Promise<{ promptTokens: number; completionTokens: number }>;
} {
  const decoder = new TextDecoder();
  let resolveUsage: (u: { promptTokens: number; completionTokens: number }) => void;
  const usage = new Promise<{ promptTokens: number; completionTokens: number }>(
    (r) => (resolveUsage = r)
  );

  // Normalize provider for stream format
  const fmt = ["groq", "openrouter", "ollama"].includes(provider) ? "openai" : provider;
  let totalChars = 0;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = rawStream.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const json = JSON.parse(data);
              let text = "";

              if (fmt === "openai") {
                text = json.choices?.[0]?.delta?.content || "";
                // Capture usage from final chunk
                if (json.usage) {
                  resolveUsage!({
                    promptTokens: json.usage.prompt_tokens || 0,
                    completionTokens: json.usage.completion_tokens || 0,
                  });
                }
              } else if (fmt === "anthropic") {
                if (json.type === "content_block_delta") {
                  text = json.delta?.text || "";
                }
                if (json.type === "message_delta" && json.usage) {
                  resolveUsage!({
                    promptTokens: json.usage.input_tokens || 0,
                    completionTokens: json.usage.output_tokens || 0,
                  });
                }
              } else if (fmt === "google") {
                text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
                if (json.usageMetadata) {
                  resolveUsage!({
                    promptTokens: json.usageMetadata.promptTokenCount || 0,
                    completionTokens: json.usageMetadata.candidatesTokenCount || 0,
                  });
                }
              }

              if (text) {
                totalChars += text.length;
                controller.enqueue(new TextEncoder().encode(text));
              }
            } catch {}
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        // Fallback usage estimation if provider didn't send it
        resolveUsage!({
          promptTokens: 0,
          completionTokens: Math.ceil(totalChars / 4),
        });
        controller.close();
      }
    },
  });

  return { stream, usage };
}

/**
 * Call LLM and collect the full text response (non-streaming).
 * Used for dispatcher and quality gate calls.
 */
export async function callLLMSync(
  config: LLMConfig,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<{ content: string; promptTokens: number; completionTokens: number }> {
  const rawStream = await callLLM(config, systemPrompt, messages);
  const { stream, usage } = parseStream(config.provider, rawStream);

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let content = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    content += decoder.decode(value, { stream: true });
  }

  const { promptTokens, completionTokens } = await usage;
  return { content, promptTokens, completionTokens };
}
