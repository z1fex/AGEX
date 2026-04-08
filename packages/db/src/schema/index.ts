import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// --- Users ---
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// --- Sessions ---
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  token: text("token").unique().notNull(),
  expiresAt: integer("expires_at").notNull(),
  createdAt: integer("created_at").notNull(),
});

// --- Clients ---
export const clients = sqliteTable("clients", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  industry: text("industry"),
  website: text("website"),
  status: text("status").default("active").notNull(),
  vaultPath: text("vault_path").notNull(),
  onboardedAt: integer("onboarded_at").notNull(),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// --- Agents (parsed from .md files) ---
export const agents = sqliteTable("agents", {
  id: text("id").primaryKey(),
  team: text("team").notNull(),
  subTeam: text("sub_team"),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  identity: text("identity").notNull(),
  filePath: text("file_path").notNull(),
  isLead: integer("is_lead").default(0),
  taskType: text("task_type"),
  parsedAt: integer("parsed_at").notNull(),
  rawMarkdown: text("raw_markdown").notNull(),
});

// --- Workflows ---
export const workflows = sqliteTable("workflows", {
  id: text("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  teams: text("teams").notNull(), // JSON array
  estimatedSteps: integer("estimated_steps").notNull(),
  deliverables: text("deliverables").notNull(), // JSON array
  filePath: text("file_path").notNull(),
  isCustom: integer("is_custom").default(0),
  createdBy: text("created_by").references(() => users.id),
  rawMarkdown: text("raw_markdown").notNull(),
  parsedAt: integer("parsed_at").notNull(),
});

// --- Workflow Steps ---
export const workflowSteps = sqliteTable("workflow_steps", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id")
    .notNull()
    .references(() => workflows.id),
  stepIndex: integer("step_index").notNull(),
  name: text("name").notNull(),
  agentFile: text("agent_file").notNull(),
  instruction: text("instruction").notNull(),
  savePathPattern: text("save_path_pattern").notNull(),
});

// --- Executions ---
export const executions = sqliteTable("executions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id),
  type: text("type").notNull(), // "agent" | "workflow"
  workflowId: text("workflow_id").references(() => workflows.id),
  agentId: text("agent_id").references(() => agents.id),
  status: text("status").notNull(), // pending | running | completed | failed | cancelled
  startedAt: integer("started_at"),
  completedAt: integer("completed_at"),
  totalCostUsd: real("total_cost_usd").default(0),
  totalTokens: integer("total_tokens").default(0),
  totalDurationMs: integer("total_duration_ms"),
  errorMessage: text("error_message"),
  createdAt: integer("created_at").notNull(),
});

// --- Execution Steps ---
export const executionSteps = sqliteTable("execution_steps", {
  id: text("id").primaryKey(),
  executionId: text("execution_id")
    .notNull()
    .references(() => executions.id),
  stepIndex: integer("step_index").notNull(),
  agentId: text("agent_id")
    .notNull()
    .references(() => agents.id),
  status: text("status").notNull(),
  modelUsed: text("model_used"),
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  costUsd: real("cost_usd"),
  durationMs: integer("duration_ms"),
  outputText: text("output_text"),
  qualityScore: integer("quality_score"),
  qualityChecks: text("quality_checks"), // JSON
  outputPath: text("output_path"),
  startedAt: integer("started_at"),
  completedAt: integer("completed_at"),
});

// --- Outputs ---
export const outputs = sqliteTable("outputs", {
  id: text("id").primaryKey(),
  executionId: text("execution_id").references(() => executions.id),
  executionStepId: text("execution_step_id").references(
    () => executionSteps.id
  ),
  clientId: text("client_id")
    .notNull()
    .references(() => clients.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  type: text("type").notNull(),
  vaultPath: text("vault_path"),
  outputPath: text("output_path"),
  content: text("content").notNull(),
  qualityScore: integer("quality_score"),
  qualityStatus: text("quality_status"),
  wordCount: integer("word_count"),
  tags: text("tags"), // JSON
  createdAt: integer("created_at").notNull(),
});

// --- Cost Tracking ---
export const costEvents = sqliteTable("cost_events", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  executionId: text("execution_id").references(() => executions.id),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  promptTokens: integer("prompt_tokens").notNull(),
  completionTokens: integer("completion_tokens").notNull(),
  costUsd: real("cost_usd").notNull(),
  durationMs: integer("duration_ms").notNull(),
  createdAt: integer("created_at").notNull(),
});

// --- Vault Index ---
export const vaultIndex = sqliteTable("vault_index", {
  id: text("id").primaryKey(),
  path: text("path").unique().notNull(),
  title: text("title"),
  section: text("section"),
  frontmatter: text("frontmatter"), // JSON
  wikilinks: text("wikilinks"), // JSON
  tags: text("tags"), // JSON
  wordCount: integer("word_count"),
  contentHash: text("content_hash"),
  modifiedAt: integer("modified_at").notNull(),
  indexedAt: integer("indexed_at").notNull(),
});

// --- LLM Provider Settings ---
export const llmSettings = sqliteTable("llm_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  provider: text("provider").notNull(),
  apiKeyEncrypted: text("api_key_encrypted"),
  apiBase: text("api_base"),
  isEnabled: integer("is_enabled").default(1),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

// --- Routing Rules ---
export const routingRules = sqliteTable("routing_rules", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  taskType: text("task_type").notNull(),
  preferredModel: text("preferred_model").notNull(),
  fallbackModel: text("fallback_model"),
  maxTokens: integer("max_tokens").default(4000),
  temperature: real("temperature").default(0.7),
});

// --- User Settings ---
export const userSettings = sqliteTable("user_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .unique()
    .notNull()
    .references(() => users.id),
  theme: text("theme").default("dark"),
  accentHue: integer("accent_hue").default(230),
  accentSaturation: integer("accent_saturation").default(80),
  accentLightness: integer("accent_lightness").default(60),
  visualEffects: integer("visual_effects").default(1),
  vaultPath: text("vault_path").default("vault/"),
  defaultModel: text("default_model").default("claude-sonnet"),
  monthlyCostLimitUsd: real("monthly_cost_limit_usd"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});
