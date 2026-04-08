import fs from "node:fs";
import path from "node:path";
import type { ParsedWorkflow, WorkflowStep } from "@agency/shared";
import {
  extractTitle,
  extractBlockquoteMeta,
  splitByHeadings,
} from "@agency/shared";

/**
 * Parse a v2 workflow .md file into a structured ParsedWorkflow.
 *
 * Expected format:
 * # [Workflow Name]
 * > **Teams:** X, Y | **Estimated steps:** N
 * ## What You'll Get
 * ## Prerequisites
 * ## Steps
 *   ### Step 1: [Name]
 *   **Read:** `agents/[team]/[agent].md`
 *   **Do:** [instruction]
 *   **Save:** `vault/[path]`
 * ### Final Delivery
 */
export function parseWorkflowFile(
  filePath: string,
  contentRoot: string
): ParsedWorkflow {
  const fullPath = path.resolve(contentRoot, filePath);
  const rawMarkdown = fs.readFileSync(fullPath, "utf-8");

  const name = extractTitle(rawMarkdown);
  const meta = extractBlockquoteMeta(rawMarkdown);
  const sections = splitByHeadings(rawMarkdown, 2);

  const sectionMap = new Map<string, string>();
  for (const section of sections) {
    sectionMap.set(section.heading.toLowerCase(), section.content);
  }

  // Parse teams from blockquote
  const teams = (meta.teams || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const estimatedSteps = parseInt(meta["estimated steps"] || "0") || 0;

  // Parse "What You'll Get" as bullet list
  const deliverables = (sectionMap.get("what you'll get") || "")
    .split("\n")
    .filter((l) => l.trim().startsWith("-"))
    .map((l) => l.replace(/^-\s*/, "").trim());

  // Parse prerequisites
  const prerequisites = (sectionMap.get("prerequisites") || "")
    .split("\n")
    .filter((l) => l.trim().startsWith("-"))
    .map((l) => l.replace(/^-\s*/, "").trim());

  // Parse steps (H3 level within the Steps section or entire file)
  const steps = parseWorkflowSteps(rawMarkdown);

  // Parse final delivery
  const finalDelivery = (sectionMap.get("final delivery") || "")
    .split("\n")
    .filter((l) => l.trim().match(/^\d+\./))
    .map((l) => l.replace(/^\d+\.\s*/, "").trim());

  const slug = path.basename(filePath, ".md");

  return {
    slug,
    name,
    teams,
    estimatedSteps: estimatedSteps || steps.length,
    deliverables,
    prerequisites,
    steps,
    finalDelivery,
    filePath,
    rawMarkdown,
  };
}

/**
 * Parse workflow steps from the raw markdown.
 * Steps follow the pattern:
 *   ### Step N: [Name]
 *   **Read:** `path`
 *   **Do:** instruction
 *   **Save:** `path`
 */
function parseWorkflowSteps(markdown: string): WorkflowStep[] {
  const steps: WorkflowStep[] = [];
  const stepRegex = /###\s+Step\s+(\d+):\s*(.+)/g;
  const lines = markdown.split("\n");

  let currentStep: Partial<WorkflowStep> | null = null;

  for (const line of lines) {
    const stepMatch = line.match(/^###\s+Step\s+(\d+):\s*(.+)/);
    if (stepMatch) {
      if (currentStep && currentStep.name) {
        steps.push(currentStep as WorkflowStep);
      }
      currentStep = {
        index: parseInt(stepMatch[1]),
        name: stepMatch[2].trim(),
        agentFile: "",
        instruction: "",
        savePath: "",
      };
      continue;
    }

    if (!currentStep) continue;

    const readMatch = line.match(/\*\*Read:\*\*\s*`?([^`\n]+)`?/);
    if (readMatch) {
      currentStep.agentFile = readMatch[1].trim();
      continue;
    }

    const doMatch = line.match(/\*\*Do:\*\*\s*(.+)/);
    if (doMatch) {
      currentStep.instruction = doMatch[1].trim();
      continue;
    }

    const saveMatch = line.match(/\*\*Save:\*\*\s*`?([^`\n]+)`?/);
    if (saveMatch) {
      currentStep.savePath = saveMatch[1].trim();
      continue;
    }
  }

  if (currentStep && currentStep.name) {
    steps.push(currentStep as WorkflowStep);
  }

  return steps;
}

/**
 * Parse all workflow files from the content directory.
 */
export function parseAllWorkflows(contentRoot: string): ParsedWorkflow[] {
  const workflowsDir = path.join(contentRoot, "workflows");
  const workflows: ParsedWorkflow[] = [];

  if (!fs.existsSync(workflowsDir)) return workflows;

  const entries = fs.readdirSync(workflowsDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.name.endsWith(".md")) continue;
    try {
      const relativePath = `workflows/${entry.name}`;
      workflows.push(parseWorkflowFile(relativePath, contentRoot));
    } catch (err) {
      console.warn(`Failed to parse workflow: ${entry.name}`, err);
    }
  }

  return workflows;
}
