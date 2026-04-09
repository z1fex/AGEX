/**
 * The dispatcher analyzes a user message and returns an execution plan.
 */
export interface DispatchResult {
  /** single-agent: one focused call. multi-agent: chain of calls. conversation: general chat, no agent needed. */
  type: "single-agent" | "multi-agent" | "workflow" | "conversation";
  plan: ExecutionStep[];
  reasoning: string;
}

export interface ExecutionStep {
  stepIndex: number;
  agentSlug: string;
  agentFile: string; // path relative to content/, e.g. "agents/content/blog-writer.md"
  teamSlug: string;
  instruction: string;
  dependsOn: number[]; // indices of steps whose output this step needs
  saveTo: {
    vault: string; // e.g. "vault/05-Content/blog/ai-trends.md"
    output: string; // e.g. "output/techflow/2026-04-09/blog-ai-trends.md"
  };
}

export interface StepResult {
  stepIndex: number;
  agentSlug: string;
  teamSlug: string;
  content: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  durationMs: number;
  savedTo: string[];
  qualityScore: number | null;
}

export interface ExecutionResult {
  steps: StepResult[];
  totalCostUsd: number;
  totalTokens: number;
  totalDurationMs: number;
}

/**
 * LLM provider configuration passed from the frontend.
 */
export interface LLMConfig {
  provider: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

/**
 * SSE events streamed back to the client during execution.
 */
export type StreamEvent =
  | { event: "step_start"; data: { stepIndex: number; agent: string; team: string } }
  | { event: "token"; data: { text: string } }
  | { event: "step_complete"; data: { stepIndex: number; agent: string; tokens: number; cost: number; durationMs: number } }
  | { event: "quality_result"; data: { stepIndex: number; score: number; passed: boolean } }
  | { event: "output_saved"; data: { path: string } }
  | { event: "done"; data: { totalCost: number; totalTokens: number; totalDurationMs: number } }
  | { event: "error"; data: { message: string } };
