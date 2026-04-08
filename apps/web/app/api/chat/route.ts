import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";

const CONTENT_ROOT = path.resolve(process.cwd(), "../../content");

/**
 * Models with large context windows get the FULL brain.
 * Free/small models get the compact version.
 */
const FULL_BRAIN_MODELS = new Set([
  // OpenAI
  "gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o3-mini",
  // Anthropic
  "claude-sonnet-4-20250514", "claude-haiku-4-5-20251001", "claude-opus-4-20250514",
  // Google
  "gemini-2.5-pro", "gemini-2.5-flash",
  // OpenRouter (full models)
  "anthropic/claude-sonnet-4", "openai/gpt-4o", "google/gemini-2.5-pro",
  "meta-llama/llama-3.1-405b-instruct", "mistralai/mistral-large",
  "deepseek/deepseek-chat-v3",
]);

/**
 * Build the FULL brain prompt — all agent identities, full detail.
 * For premium models with 100K+ context.
 */
function buildFullBrainPrompt(): string {
  const agentSummaries: string[] = [];
  const agentsDir = path.join(CONTENT_ROOT, "agents");

  function walkAgents(dir: string) {
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) walkAgents(fullPath);
        else if (entry.name.endsWith(".md")) {
          try {
            const content = fs.readFileSync(fullPath, "utf-8");
            const name = content.match(/^#\s+(.+)$/m)?.[1] || entry.name;
            const team = content.match(/\*\*Team:\*\*\s*([^|]+)/)?.[1]?.trim() || "";
            const identity = content.match(/## Identity\n([\s\S]*?)(?=\n##|$)/)?.[1]?.trim().slice(0, 300) || "";
            const whenToUse = content.match(/## When to Use\n([\s\S]*?)(?=\n##|$)/)?.[1]?.trim().slice(0, 150) || "";
            agentSummaries.push(`### ${name} (${team})\n${identity}\nUse when: ${whenToUse}`);
          } catch {}
        }
      }
    } catch {}
  }
  walkAgents(agentsDir);

  // Read CLAUDE.md
  let claudeMd = "";
  for (const p of [
    path.join(CONTENT_ROOT, "CLAUDE.md"),
    "C:/Users/prosa/Desktop/AI AGENCY IN A BOX/CLAUDE.md",
  ]) {
    try { claudeMd = fs.readFileSync(p, "utf-8").slice(0, 4000); break; } catch {}
  }

  const workflows: string[] = [];
  try {
    for (const f of fs.readdirSync(path.join(CONTENT_ROOT, "workflows"))) {
      if (!f.endsWith(".md")) continue;
      const content = fs.readFileSync(path.join(CONTENT_ROOT, "workflows", f), "utf-8");
      const name = content.match(/^#\s+(.+)$/m)?.[1] || f;
      const deliverables = content.match(/## What You'll Get\n([\s\S]*?)(?=\n##|$)/)?.[1]?.trim().slice(0, 200) || "";
      workflows.push(`**${name}**: ${deliverables}`);
    }
  } catch {}

  return `You are "Agency in a Box" — a complete AI-powered agency with 8 specialized teams and 113+ agents.

You are the agency brain. When the user asks for anything, determine which agents/teams are needed and execute the work directly.

## Your Agents (Full Registry)

${agentSummaries.join("\n\n")}

## Available Workflows

${workflows.join("\n")}

## How You Work

1. User describes what they need
2. Identify which agents/teams are relevant
3. State your plan briefly
4. Execute the work — write content, build strategies, analyze competitors
5. Deliver complete, professional output

## Rules

- You ARE the agency. Don't say "I would deploy X" — just do the work.
- No placeholders, no filler. Specific, actionable, professional.
- For large tasks, break into steps and deliver each one.
- Ask for context if needed before starting.
- Match quality standards: structured with headers, real examples, data-driven.
- You CANNOT save files to vault or disk yet. If the user asks you to save something, say: "Vault saving is coming in v1.5. For now, I'll generate everything here in chat — you can copy it." Then generate the content.
- You CANNOT search the web or access URLs. Use your training knowledge. If asked to research something, do your best from what you know and note that live web search is coming in a future update.
- NEVER break character. You are AGEX, not "a text-based AI assistant." Always respond as the agency.
- NEVER say "I'm not capable of" or "I don't have the ability." Instead, say what you CAN do and deliver value.`;
}

/**
 * Build COMPACT brain prompt for free/small models.
 */
function buildCompactBrainPrompt(): string {
  const agentList: string[] = [];
  const agentsDir = path.join(CONTENT_ROOT, "agents");

  function walkAgents(dir: string) {
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) walkAgents(fullPath);
        else if (entry.name.endsWith(".md") && !entry.name.startsWith("_")) {
          try {
            const content = fs.readFileSync(fullPath, "utf-8");
            const name = content.match(/^#\s+(.+)$/m)?.[1] || entry.name;
            const team = content.match(/\*\*Team:\*\*\s*([^|]+)/)?.[1]?.trim() || "";
            agentList.push(`${name} (${team})`);
          } catch {}
        }
      }
    } catch {}
  }
  walkAgents(agentsDir);

  // Compact workflow list
  const workflows: string[] = [];
  try {
    for (const f of fs.readdirSync(path.join(CONTENT_ROOT, "workflows"))) {
      if (!f.endsWith(".md")) continue;
      const content = fs.readFileSync(path.join(CONTENT_ROOT, "workflows", f), "utf-8");
      const name = content.match(/^#\s+(.+)$/m)?.[1] || f;
      workflows.push(name);
    }
  } catch {}

  return `You are AGEX — an AI agency platform with 8 teams and 113+ agents.

YOUR 8 TEAMS:
1. Marketing (60 agents) — SEO, Social Media, Email, PPC, PR, Influencer, Events, Affiliate, Brand, Analytics, CRO, Community, Partnerships
2. Sales (10) — Cold outreach, lead scoring, proposals, follow-ups, CRM, objection handling
3. Intelligence (10) — Competitor monitoring, news, sentiment analysis, trend tracking
4. Strategy (7) — SWOT, positioning, pricing, go-to-market, market entry
5. Content (10) — Blogs, social posts, newsletters, case studies, scripts, whitepapers
6. Research (8) — Market sizing, competitor teardowns, customer research, tech scouting
7. Direction (4) — OKRs, roadmaps, quarterly planning, priorities
8. Managing (4) — Project tracking, timelines, resource allocation

WORKFLOWS: ${workflows.join(", ")}

RULES:
- You ARE the agency. Execute the work directly — write content, build strategies, analyze competitors.
- State which team you're using, then deliver the actual output.
- No placeholders or filler. Professional, specific, actionable.
- Ask for context if needed (company, audience, goals) before starting.
- For large requests, break into steps.
- You CANNOT save to vault yet. If asked, say "Vault saving is coming in v1.5 — I'll generate it here for you." Then deliver the content.
- You CANNOT search the web. Use your training knowledge.
- NEVER break character. You are AGEX. Never say "I'm just a text assistant" or "I'm not capable of."
- Always deliver value. If you can't do something exactly, do the closest thing you can and say what's coming next.`;
}

// Cache both brain versions (rebuild on server restart)
let cachedFullBrain: string | null = null;
let cachedCompactBrain: string | null = null;

function getBrain(model: string): string {
  if (FULL_BRAIN_MODELS.has(model)) {
    if (!cachedFullBrain) cachedFullBrain = buildFullBrainPrompt();
    return cachedFullBrain;
  }
  if (!cachedCompactBrain) cachedCompactBrain = buildCompactBrainPrompt();
  return cachedCompactBrain;
}

/**
 * Call OpenAI-compatible API (works with OpenAI, Ollama, Groq, Together)
 */
async function callOpenAI(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  baseUrl = "https://api.openai.com/v1"
): Promise<ReadableStream> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 8192,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${err}`);
  }

  return res.body!;
}

/**
 * Call Anthropic Messages API
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
    throw new Error(`Anthropic API error (${res.status}): ${err}`);
  }

  return res.body!;
}

/**
 * Call Google Gemini API
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
    throw new Error(`Google API error (${res.status}): ${err}`);
  }

  return res.body!;
}

/**
 * Transform provider-specific SSE streams into a unified text stream.
 */
function createUnifiedStream(
  provider: string,
  rawStream: ReadableStream
): ReadableStream {
  const decoder = new TextDecoder();

  return new ReadableStream({
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

              if (provider === "openai" || provider === "ollama") {
                text = json.choices?.[0]?.delta?.content || "";
              } else if (provider === "anthropic") {
                if (json.type === "content_block_delta") {
                  text = json.delta?.text || "";
                }
              } else if (provider === "google") {
                text =
                  json.candidates?.[0]?.content?.parts?.[0]?.text || "";
              }

              if (text) {
                controller.enqueue(new TextEncoder().encode(text));
              }
            } catch {}
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, provider, apiKey, model, baseUrl } = body as {
      messages: { role: string; content: string }[];
      provider: string;
      apiKey: string;
      model: string;
      baseUrl?: string;
    };

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

    const brain = getBrain(model);

    // Build messages with brain as system prompt
    const fullMessages = [
      { role: "system", content: brain },
      ...messages,
    ];

    let rawStream: ReadableStream;

    switch (provider) {
      case "openai":
        rawStream = await callOpenAI(apiKey, model, fullMessages);
        break;
      case "anthropic":
        rawStream = await callAnthropic(apiKey, model, brain, messages);
        break;
      case "google":
        rawStream = await callGoogle(apiKey, model, brain, messages);
        break;
      case "groq":
        rawStream = await callOpenAI(
          apiKey,
          model,
          fullMessages,
          "https://api.groq.com/openai/v1"
        );
        break;
      case "openrouter":
        rawStream = await callOpenAI(
          apiKey,
          model,
          fullMessages,
          "https://openrouter.ai/api/v1"
        );
        break;
      case "ollama":
        rawStream = await callOpenAI(
          "ollama",
          model,
          fullMessages,
          baseUrl || "http://localhost:11434/v1"
        );
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown provider: ${provider}` }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // These providers use OpenAI-compatible stream format
    const openaiCompatible = ["openrouter", "groq", "ollama"];
    const streamProvider = openaiCompatible.includes(provider) ? "openai" : provider;
    const stream = createUnifiedStream(streamProvider, rawStream);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "LLM call failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
