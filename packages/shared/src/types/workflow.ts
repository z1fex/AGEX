export interface ParsedWorkflow {
  slug: string;
  name: string;
  teams: string[];
  estimatedSteps: number;
  deliverables: string[];
  prerequisites: string[];
  steps: WorkflowStep[];
  finalDelivery: string[];
  filePath: string;
  rawMarkdown: string;
}

export interface WorkflowStep {
  index: number;
  name: string;
  agentFile: string;
  instruction: string;
  savePath: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  clientId: string;
  userId: string;
  status: ExecutionStatus;
  currentStep: number;
  totalSteps: number;
  startedAt: number | null;
  completedAt: number | null;
  totalCostUsd: number;
  totalTokens: number;
  totalDurationMs: number | null;
  error: string | null;
}

export interface StepExecution {
  id: string;
  executionId: string;
  stepIndex: number;
  agentSlug: string;
  status: ExecutionStatus;
  modelUsed: string | null;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  durationMs: number | null;
  output: string | null;
  qualityScore: number | null;
  outputPath: string | null;
  startedAt: number | null;
  completedAt: number | null;
}

export type ExecutionStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled"
  | "skipped";
