"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Megaphone,
  Handshake,
  Radar,
  Compass,
  PenTool,
  Microscope,
  Target,
  UsersRound,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EASE_OUT_SMOOTH } from "@/lib/utils";

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  },
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  marketing: Megaphone,
  sales: Handshake,
  intelligence: Radar,
  strategy: Compass,
  content: PenTool,
  research: Microscope,
  direction: Target,
  managing: UsersRound,
};

const teams = [
  {
    slug: "marketing",
    name: "Marketing",
    agents: 60,
    subTeams: 13,
    color: "#6366f1",
    description: "SEO, Social, Email, PPC, Influencer, Events, PR, and more",
  },
  {
    slug: "sales",
    name: "Sales",
    agents: 10,
    subTeams: 0,
    color: "#22d3ee",
    description: "Cold outreach, lead scoring, proposals, follow-ups, CRM",
  },
  {
    slug: "intelligence",
    name: "Intelligence",
    agents: 10,
    subTeams: 0,
    color: "#f43f5e",
    description: "Competitor monitoring, news, sentiment, trend tracking",
  },
  {
    slug: "strategy",
    name: "Strategy",
    agents: 7,
    subTeams: 0,
    color: "#a855f7",
    description: "SWOT, positioning, pricing, go-to-market planning",
  },
  {
    slug: "content",
    name: "Content",
    agents: 10,
    subTeams: 0,
    color: "#10b981",
    description: "Blogs, social posts, newsletters, case studies, scripts",
  },
  {
    slug: "research",
    name: "Research",
    agents: 8,
    subTeams: 0,
    color: "#f59e0b",
    description: "Market sizing, competitor teardowns, customer research",
  },
  {
    slug: "direction",
    name: "Direction",
    agents: 4,
    subTeams: 0,
    color: "#3b82f6",
    description: "OKRs, roadmaps, quarterly planning, priorities",
  },
  {
    slug: "managing",
    name: "Managing",
    agents: 4,
    subTeams: 0,
    color: "#ec4899",
    description: "Project tracking, timelines, resource allocation, reports",
  },
];

export default function AgentsPage() {
  return (
    <motion.div initial="hidden" animate="show" variants={stagger}>
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          AI Agent Teams
        </h2>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          8 specialized teams with 113+ agents ready to execute.
        </p>
      </motion.div>

      {/* Team Grid */}
      <motion.div
        variants={stagger}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {teams.map((team) => {
          const Icon = iconMap[team.slug] || Target;
          return (
            <motion.div key={team.slug} variants={fadeUp}>
              <Link href={`/dashboard/agents/${team.slug}`}>
                <Card
                  glass
                  className="group cursor-pointer transition-all hover:scale-[1.02]"
                  style={
                    {
                      "--team-color": team.color,
                    } as React.CSSProperties
                  }
                >
                  <CardContent className="p-5">
                    {/* Icon with team glow */}
                    <motion.div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${team.color}15`,
                        color: team.color,
                      }}
                      whileHover={{
                        boxShadow: `0 0 20px ${team.color}40`,
                      }}
                    >
                      <Icon className="h-6 w-6" />
                    </motion.div>

                    {/* Team name */}
                    <h3 className="text-base font-semibold text-[hsl(var(--foreground))]">
                      {team.name}
                    </h3>

                    {/* Description */}
                    <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">
                      {team.description}
                    </p>

                    {/* Stats */}
                    <div className="mt-4 flex items-center gap-3">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${team.color}15`,
                          color: team.color,
                        }}
                      >
                        {team.agents} agents
                      </span>
                      {team.subTeams > 0 && (
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          {team.subTeams} sub-teams
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
