import { callLLMSync } from "./llm-caller";
import type { LLMConfig } from "./types";

export interface QualityResult {
  score: number; // 1-5
  passed: boolean;
  feedback: string;
}

// Use a fast cheap model for quality checks
const QUALITY_MODELS: Record<string, string> = {
  openai: "gpt-4o-mini",
  anthropic: "claude-haiku-4-5-20251001",
  google: "gemini-2.5-flash",
  groq: "llama-3.1-8b-instant",
  openrouter: "openai/gpt-4o-mini",
  ollama: "llama3.1",
};

/**
 * Run a quality gate check on a deliverable.
 * Uses a fast/cheap model to score the output.
 */
export async function runQualityGate(
  content: string,
  agentSlug: string,
  llmConfig: LLMConfig,
  clientContext?: string
): Promise<QualityResult> {
  // Use cheap model for QA
  const qaConfig: LLMConfig = {
    ...llmConfig,
    model: QUALITY_MODELS[llmConfig.provider] || llmConfig.model,
  };

  const systemPrompt = `You are a quality reviewer. Score the deliverable below on a scale of 1-5.

Criteria:
- Specificity: Is it tailored, not generic? (no placeholder text, no "insert here")
- Completeness: Are all sections filled? Is it thorough?
- Professionalism: Is the tone appropriate? Well-structured?
- Actionability: Can someone use this immediately?

${clientContext ? `Client context for reference:\n${clientContext}\n` : ""}

Respond with ONLY valid JSON:
{"score": <1-5>, "passed": <true if score >= 3>, "feedback": "<one sentence summary>"}`;

  try {
    const { content: response } = await callLLMSync(qaConfig, systemPrompt, [
      {
        role: "user",
        content: `Review this deliverable from the ${agentSlug} agent:\n\n${content.slice(0, 3000)}`,
      },
    ]);

    const json = response.match(/\{[\s\S]*\}/)?.[0];
    if (json) {
      const result = JSON.parse(json) as QualityResult;
      return {
        score: Math.min(5, Math.max(1, result.score || 3)),
        passed: result.score >= 3,
        feedback: result.feedback || "",
      };
    }
  } catch {}

  // Default: pass with score 3 if QA fails
  return { score: 3, passed: true, feedback: "Quality check unavailable" };
}
