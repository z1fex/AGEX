import { Hono } from "hono";
import path from "node:path";
import {
  parseAllWorkflows,
  parseWorkflowFile,
} from "../engine/workflow-parser.js";

const CONTENT_ROOT = path.resolve(process.cwd(), "content");

export const workflowsRouter = new Hono();

// List all workflows
workflowsRouter.get("/", (c) => {
  const workflows = parseAllWorkflows(CONTENT_ROOT);
  return c.json({
    total: workflows.length,
    workflows: workflows.map((w) => ({
      slug: w.slug,
      name: w.name,
      teams: w.teams,
      estimatedSteps: w.estimatedSteps,
      deliverables: w.deliverables,
    })),
  });
});

// Get single workflow detail
workflowsRouter.get("/:slug", (c) => {
  const slug = c.req.param("slug");
  const filePath = `workflows/${slug}.md`;

  try {
    const parsed = parseWorkflowFile(filePath, CONTENT_ROOT);
    return c.json(parsed);
  } catch {
    return c.json({ error: `Workflow not found: ${slug}` }, 404);
  }
});
