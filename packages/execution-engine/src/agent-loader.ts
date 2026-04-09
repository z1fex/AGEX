import fs from "node:fs";
import path from "node:path";

/**
 * Load a single agent's .md file and build a focused system prompt.
 * This replaces the v1 approach of loading ALL agents into one prompt.
 */
export function loadAgentPrompt(
  agentFile: string,
  contentRoot: string,
  options?: {
    clientContext?: string;
    priorStepOutputs?: string;
    taskInstruction?: string;
  }
): string {
  const fullPath = path.resolve(contentRoot, agentFile);
  const raw = fs.readFileSync(fullPath, "utf-8");

  // Parse sections from the agent .md file
  const name = raw.match(/^#\s+(.+)$/m)?.[1] || "Agent";
  const identity = extractSection(raw, "Identity");
  const instructions = extractSection(raw, "Instructions");
  const outputFormat = extractSection(raw, "Output Format");

  const parts: string[] = [
    `You are **${name}** at AGEX, an AI agency platform.\n`,
    identity,
  ];

  // Client context (if available)
  if (options?.clientContext) {
    parts.push(`\n## Your Client\n${options.clientContext}`);
  }

  // Task instruction from dispatcher
  if (options?.taskInstruction) {
    parts.push(`\n## Your Task\n${options.taskInstruction}`);
  }

  // Prior step outputs for chained execution
  if (options?.priorStepOutputs) {
    parts.push(`\n## Prior Work (from other agents)\nUse this as context:\n${options.priorStepOutputs}`);
  }

  // Agent's own instructions
  if (instructions) {
    parts.push(`\n## How to Execute\n${instructions}`);
  }

  // Output format
  if (outputFormat) {
    parts.push(`\n## Output Format\n${outputFormat}`);
  }

  // Rules
  parts.push(`
## Rules
- You are ${name}. Stay in character.
- Deliver the actual work — not a description of what you would do.
- No placeholders, no filler. Specific, actionable, professional.
- You CANNOT save files, search the web, or access URLs. Generate everything in text.
- If you need more context, ask the user.`);

  return parts.join("\n");
}

/**
 * Build a compact agent registry for the dispatcher.
 * Lists all teams + agent names (NOT full identities — keep it small).
 */
export function buildAgentRegistry(contentRoot: string): string {
  const agentsDir = path.join(contentRoot, "agents");
  const teams: Record<string, string[]> = {};

  function walk(dir: string, teamSlug: string) {
    try {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath, teamSlug);
        } else if (entry.name.endsWith(".md") && !entry.name.startsWith("_")) {
          try {
            const content = fs.readFileSync(fullPath, "utf-8");
            const name = content.match(/^#\s+(.+)$/m)?.[1] || entry.name;
            const relativePath = path.relative(contentRoot, fullPath).replace(/\\/g, "/");
            if (!teams[teamSlug]) teams[teamSlug] = [];
            teams[teamSlug].push(`${name} [${relativePath}]`);
          } catch {}
        }
      }
    } catch {}
  }

  // Walk each team directory
  try {
    for (const teamDir of fs.readdirSync(agentsDir, { withFileTypes: true })) {
      if (teamDir.isDirectory() && !teamDir.name.startsWith("_")) {
        walk(path.join(agentsDir, teamDir.name), teamDir.name);
      }
    }
  } catch {}

  // Build registry string
  const lines: string[] = [];
  for (const [team, agents] of Object.entries(teams)) {
    lines.push(`**${team}**: ${agents.join(", ")}`);
  }
  return lines.join("\n");
}

/**
 * Build a workflow registry for the dispatcher.
 */
export function buildWorkflowRegistry(contentRoot: string): string {
  const workflowsDir = path.join(contentRoot, "workflows");
  const workflows: string[] = [];

  try {
    for (const f of fs.readdirSync(workflowsDir)) {
      if (!f.endsWith(".md")) continue;
      const content = fs.readFileSync(path.join(workflowsDir, f), "utf-8");
      const name = content.match(/^#\s+(.+)$/m)?.[1] || f;

      // Extract steps
      const steps = content.match(/### Step \d+: (.+)/g)?.map((s) => s.replace(/### Step \d+: /, "")) || [];

      workflows.push(`**${name}** (${f.replace(".md", "")}): ${steps.join(" → ")}`);
    }
  } catch {}

  return workflows.join("\n");
}

/**
 * Extract a ## section's content from markdown.
 */
function extractSection(md: string, sectionName: string): string {
  const regex = new RegExp(`## ${sectionName}\\n([\\s\\S]*?)(?=\\n## |$)`, "i");
  return regex.exec(md)?.[1]?.trim() || "";
}
