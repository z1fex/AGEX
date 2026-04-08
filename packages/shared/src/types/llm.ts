export type LLMProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "ollama"
  | "together"
  | "groq";

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  apiBase?: string;
  maxTokens: number;
  temperature: number;
}

export interface RoutingRule {
  taskType: string;
  preferredModel: string;
  fallbackModel: string | null;
  maxTokens: number;
  temperature: number;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: LLMProvider;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  durationMs: number;
}

export interface LLMStreamEvent {
  type: "token" | "done" | "error";
  token?: string;
  fullContent?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    costUsd: number;
  };
  error?: string;
}
