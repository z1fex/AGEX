import fs from "node:fs";
import path from "node:path";

export interface CostEvent {
  id: string;
  agent: string;
  team: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  durationMs: number;
  clientSlug?: string;
  timestamp: number;
}

export interface CostSummary {
  totalCost: number;
  totalTokens: number;
  totalChats: number;
  agentsUsed: number;
  avgResponseMs: number;
  costByProvider: Record<string, number>;
  costByTeam: Record<string, number>;
  costByDay: { date: string; cost: number; tokens: number }[];
}

const COST_FILE = "cost-events.json";

/**
 * Record a cost event (appends to JSON file).
 */
export function recordCost(
  dataDir: string,
  event: Omit<CostEvent, "id" | "timestamp">
): void {
  const filePath = path.join(dataDir, COST_FILE);
  const events = loadEvents(filePath);

  events.push({
    ...event,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  });

  // Keep last 5000 events max
  const trimmed = events.slice(-5000);
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(trimmed, null, 2), "utf-8");
}

/**
 * Get cost summary for analytics.
 */
export function getCostSummary(dataDir: string, days = 30): CostSummary {
  const filePath = path.join(dataDir, COST_FILE);
  const events = loadEvents(filePath);

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recent = events.filter((e) => e.timestamp >= cutoff);

  const costByProvider: Record<string, number> = {};
  const costByTeam: Record<string, number> = {};
  const costByDayMap: Record<string, { cost: number; tokens: number }> = {};
  const agents = new Set<string>();
  let totalDuration = 0;

  for (const e of recent) {
    costByProvider[e.provider] = (costByProvider[e.provider] || 0) + e.costUsd;
    costByTeam[e.team] = (costByTeam[e.team] || 0) + e.costUsd;
    agents.add(e.agent);
    totalDuration += e.durationMs;

    const day = new Date(e.timestamp).toISOString().split("T")[0];
    if (!costByDayMap[day]) costByDayMap[day] = { cost: 0, tokens: 0 };
    costByDayMap[day].cost += e.costUsd;
    costByDayMap[day].tokens += e.promptTokens + e.completionTokens;
  }

  const costByDay = Object.entries(costByDayMap)
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalCost: recent.reduce((sum, e) => sum + e.costUsd, 0),
    totalTokens: recent.reduce((sum, e) => sum + e.promptTokens + e.completionTokens, 0),
    totalChats: recent.length,
    agentsUsed: agents.size,
    avgResponseMs: recent.length > 0 ? Math.round(totalDuration / recent.length) : 0,
    costByProvider,
    costByTeam,
    costByDay,
  };
}

function loadEvents(filePath: string): CostEvent[] {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}
