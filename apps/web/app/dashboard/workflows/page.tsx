"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Workflow,
  ArrowRight,
  Play,
  FileText,
  Search,
  Mail,
  BarChart3,
  Megaphone,
  Target,
  Rocket,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  "content-month": FileText,
  "competitor-report": Search,
  "email-sequence": Mail,
  "full-strategy": Target,
  "lead-generation": BarChart3,
  "product-launch": Rocket,
  "seo-overhaul": Search,
  "social-media-blitz": Megaphone,
  "brand-audit": Target,
};

const workflows = [
  {
    slug: "content-month",
    name: "Content Month",
    teams: ["Intelligence", "Content"],
    steps: 7,
    deliverables: ["Trend report", "Content calendar", "4 blog posts", "12 social posts"],
  },
  {
    slug: "product-launch",
    name: "Product Launch",
    teams: ["Research", "Strategy", "Marketing", "Content"],
    steps: 11,
    deliverables: ["Market research", "Positioning", "Landing page", "Launch emails"],
  },
  {
    slug: "competitor-report",
    name: "Competitor Report",
    teams: ["Intelligence", "Research"],
    steps: 5,
    deliverables: ["Competitor profiles", "SWOT analysis", "Strategy recommendations"],
  },
  {
    slug: "lead-generation",
    name: "Lead Generation",
    teams: ["Sales", "Content"],
    steps: 6,
    deliverables: ["Lead magnets", "Email sequences", "Cold outreach scripts"],
  },
  {
    slug: "full-strategy",
    name: "Full Strategy",
    teams: ["Strategy", "Research", "Intelligence"],
    steps: 10,
    deliverables: ["Market analysis", "SWOT", "Positioning", "Go-to-market plan"],
  },
  {
    slug: "email-sequence",
    name: "Email Sequence",
    teams: ["Sales", "Content"],
    steps: 5,
    deliverables: ["Welcome sequence", "Nurture emails", "Sales follow-ups"],
  },
  {
    slug: "seo-overhaul",
    name: "SEO Overhaul",
    teams: ["Marketing", "Content"],
    steps: 7,
    deliverables: ["SEO audit", "Keyword strategy", "Content briefs", "Meta tags"],
  },
  {
    slug: "social-media-blitz",
    name: "Social Media Blitz",
    teams: ["Marketing", "Content"],
    steps: 6,
    deliverables: ["Platform strategy", "Content calendar", "30 posts", "Hashtag sets"],
  },
  {
    slug: "brand-audit",
    name: "Brand Audit",
    teams: ["Strategy", "Intelligence"],
    steps: 5,
    deliverables: ["Brand analysis", "Perception report", "Recommendations"],
  },
];

export default function WorkflowsPage() {
  return (
    <motion.div initial="hidden" animate="show" variants={stagger}>
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            Workflows
          </h2>
          <p className="mt-1 text-[hsl(var(--muted-foreground))]">
            9 battle-tested playbooks that chain agents into complete deliverables.
          </p>
        </div>
      </motion.div>

      {/* Workflow Grid */}
      <motion.div
        variants={stagger}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        {workflows.map((wf) => {
          const Icon = iconMap[wf.slug] || Workflow;
          return (
            <motion.div key={wf.slug} variants={fadeUp}>
              <Link href={`/dashboard/workflows/${wf.slug}`}>
                <Card
                  glass
                  className="group cursor-pointer transition-all hover:scale-[1.01] hover:border-[hsl(var(--primary)/0.3)]"
                >
                  <CardContent className="p-5">
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-[hsl(var(--muted))] px-2.5 py-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                        {wf.steps} steps
                      </span>
                    </div>

                    {/* Name */}
                    <h3 className="mt-4 text-base font-semibold text-[hsl(var(--foreground))]">
                      {wf.name}
                    </h3>

                    {/* Teams */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {wf.teams.map((team) => (
                        <span
                          key={team}
                          className="rounded-md bg-[hsl(var(--muted))] px-2 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))]"
                        >
                          {team}
                        </span>
                      ))}
                    </div>

                    {/* Deliverables */}
                    <div className="mt-3 space-y-1">
                      {wf.deliverables.slice(0, 3).map((d, i) => (
                        <p
                          key={i}
                          className="text-xs text-[hsl(var(--muted-foreground))]"
                        >
                          • {d}
                        </p>
                      ))}
                      {wf.deliverables.length > 3 && (
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                          +{wf.deliverables.length - 3} more
                        </p>
                      )}
                    </div>

                    {/* Run button */}
                    <div className="mt-4 flex items-center justify-between">
                      <Button
                        variant="glass"
                        size="sm"
                        className="gap-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Play className="h-3 w-3" />
                        Run
                      </Button>
                      <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
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
