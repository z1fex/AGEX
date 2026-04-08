import { Hono } from "hono";
import path from "node:path";
import { parseAllAgents, parseAgentFile } from "../engine/agent-parser.js";

const CONTENT_ROOT = path.resolve(process.cwd(), "content");

export const agentsRouter = new Hono();

// List all agents
agentsRouter.get("/", (c) => {
  const agents = parseAllAgents(CONTENT_ROOT);
  return c.json({
    total: agents.length,
    agents: agents.map((a) => ({
      slug: a.slug,
      name: a.name,
      team: a.team,
      subTeam: a.subTeam,
      filePath: a.filePath,
      whenToUse: a.whenToUse.slice(0, 200),
    })),
  });
});

// List agents by team
agentsRouter.get("/:team", (c) => {
  const team = c.req.param("team");
  const agents = parseAllAgents(CONTENT_ROOT).filter(
    (a) => a.team.toLowerCase() === team.toLowerCase()
  );
  return c.json({
    team,
    total: agents.length,
    agents: agents.map((a) => ({
      slug: a.slug,
      name: a.name,
      subTeam: a.subTeam,
      filePath: a.filePath,
      whenToUse: a.whenToUse.slice(0, 200),
    })),
  });
});

// Get single agent detail
agentsRouter.get("/:team/:agent", (c) => {
  const { team, agent: agentSlug } = c.req.param();
  const filePath = `agents/${team}/${agentSlug}.md`;

  try {
    const parsed = parseAgentFile(filePath, CONTENT_ROOT);
    return c.json(parsed);
  } catch {
    return c.json({ error: `Agent not found: ${filePath}` }, 404);
  }
});
