export const TEAMS = {
  marketing: {
    name: "Marketing",
    slug: "marketing",
    color: "#6366f1", // Indigo — nebula purple
    agentCount: 60,
    subTeamCount: 13,
    leadFile: "agents/marketing/_lead.md",
    icon: "megaphone",
  },
  sales: {
    name: "Sales",
    slug: "sales",
    color: "#22d3ee", // Cyan — electric blue
    agentCount: 10,
    subTeamCount: 0,
    leadFile: "agents/sales/_lead.md",
    icon: "handshake",
  },
  intelligence: {
    name: "Intelligence",
    slug: "intelligence",
    color: "#f43f5e", // Rose — supernova red
    agentCount: 10,
    subTeamCount: 0,
    leadFile: "agents/intelligence/_lead.md",
    icon: "radar",
  },
  strategy: {
    name: "Strategy",
    slug: "strategy",
    color: "#a855f7", // Purple — deep space violet
    agentCount: 7,
    subTeamCount: 0,
    leadFile: "agents/strategy/_lead.md",
    icon: "compass",
  },
  content: {
    name: "Content",
    slug: "content",
    color: "#10b981", // Emerald — aurora green
    agentCount: 10,
    subTeamCount: 0,
    leadFile: "agents/content/_lead.md",
    icon: "pen-tool",
  },
  research: {
    name: "Research",
    slug: "research",
    color: "#f59e0b", // Amber — solar gold
    agentCount: 8,
    subTeamCount: 0,
    leadFile: "agents/research/_lead.md",
    icon: "microscope",
  },
  direction: {
    name: "Direction",
    slug: "direction",
    color: "#3b82f6", // Blue — pulsar blue
    agentCount: 4,
    subTeamCount: 0,
    leadFile: "agents/direction/_lead.md",
    icon: "target",
  },
  managing: {
    name: "Managing",
    slug: "managing",
    color: "#ec4899", // Pink — cosmic pink
    agentCount: 4,
    subTeamCount: 0,
    leadFile: "agents/managing/_lead.md",
    icon: "users",
  },
} as const;

export type TeamSlug = keyof typeof TEAMS;

export const TEAM_SLUGS = Object.keys(TEAMS) as TeamSlug[];

export const TOTAL_AGENTS = Object.values(TEAMS).reduce(
  (sum, t) => sum + t.agentCount,
  0
);
