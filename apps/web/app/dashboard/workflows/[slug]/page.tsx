"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  Clock,
  Users,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EASE_OUT_SMOOTH } from "@/lib/utils";

// Workflow data (same as list page — will be replaced with API data later)
const workflowData: Record<string, any> = {
  "content-month": {
    name: "Content Month",
    teams: ["Intelligence", "Content"],
    steps: [
      { name: "Trend Research", agent: "Trend Researcher", team: "Intelligence" },
      { name: "Content Calendar", agent: "Content Strategist", team: "Content" },
      { name: "Blog Post 1", agent: "Blog Writer", team: "Content" },
      { name: "Blog Post 2", agent: "Blog Writer", team: "Content" },
      { name: "Blog Post 3", agent: "Blog Writer", team: "Content" },
      { name: "Blog Post 4", agent: "Blog Writer", team: "Content" },
      { name: "Social Posts", agent: "Social Media Manager", team: "Content" },
    ],
    deliverables: ["Trend report", "Content calendar", "4 blog posts", "12 social posts"],
  },
  "product-launch": {
    name: "Product Launch",
    teams: ["Research", "Strategy", "Marketing", "Content"],
    steps: [
      { name: "Market Research", agent: "Market Analyst", team: "Research" },
      { name: "Competitor Analysis", agent: "Competitor Deep Diver", team: "Research" },
      { name: "Customer Research", agent: "Customer Researcher", team: "Research" },
      { name: "SWOT Analysis", agent: "SWOT Analyst", team: "Strategy" },
      { name: "Positioning", agent: "Positioning Expert", team: "Strategy" },
      { name: "Pricing Strategy", agent: "Pricing Strategist", team: "Strategy" },
      { name: "Go-to-Market Plan", agent: "GTM Planner", team: "Strategy" },
      { name: "Landing Page Copy", agent: "Blog Writer", team: "Content" },
      { name: "Launch Emails", agent: "Email Marketer", team: "Marketing" },
      { name: "Social Campaign", agent: "Social Media Manager", team: "Content" },
      { name: "PR Brief", agent: "PR Specialist", team: "Marketing" },
    ],
    deliverables: ["Market research", "Positioning doc", "Landing page", "Launch emails", "PR brief"],
  },
  "competitor-report": {
    name: "Competitor Report",
    teams: ["Intelligence", "Research"],
    steps: [
      { name: "Competitor Identification", agent: "Industry Scanner", team: "Intelligence" },
      { name: "Deep Dive Analysis", agent: "Competitor Deep Diver", team: "Research" },
      { name: "SWOT Comparison", agent: "SWOT Analyst", team: "Strategy" },
      { name: "Market Positioning Map", agent: "Market Analyst", team: "Research" },
      { name: "Executive Brief", agent: "Research Compiler", team: "Research" },
    ],
    deliverables: ["Competitor profiles", "SWOT analysis", "Strategy recommendations"],
  },
};

// Fallback for workflows not explicitly defined
function getWorkflow(slug: string) {
  if (workflowData[slug]) return workflowData[slug];
  const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    name,
    teams: ["Agency"],
    steps: [{ name: "Execute", agent: "Dispatcher", team: "Agency" }],
    deliverables: ["Output"],
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_SMOOTH as any } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export default function WorkflowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const wf = getWorkflow(slug);

  const [running, setRunning] = useState(false);

  const handleRun = () => {
    // Navigate to chat with a pre-filled message to run this workflow
    router.push(
      `/dashboard/chat?run=${encodeURIComponent(`Run the "${wf.name}" workflow for my client.`)}`
    );
  };

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-4xl space-y-6">
      {/* Back + Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">{wf.name}</h2>
          <div className="mt-1 flex gap-2">
            {wf.teams.map((t: string) => (
              <span key={t} className="rounded-md bg-[hsl(var(--primary)/0.1)] px-2 py-0.5 text-xs font-medium text-[hsl(var(--primary))]">
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Run Button */}
      <motion.div variants={fadeUp}>
        <Button onClick={handleRun} size="lg" className="gap-2">
          <Play className="h-4 w-4" />
          Run in Chat
        </Button>
      </motion.div>

      {/* Steps */}
      <motion.div variants={fadeUp}>
        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              {wf.steps.length} Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {wf.steps.map((step: any, i: number) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-sm font-bold text-[hsl(var(--muted-foreground))]">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                      {step.name}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      Agent: {step.agent} ({step.team})
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Deliverables */}
      <motion.div variants={fadeUp}>
        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
              Deliverables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {wf.deliverables.map((d: string, i: number) => (
                <div key={i} className="flex items-center gap-3 text-sm text-[hsl(var(--foreground))]">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                  {d}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
