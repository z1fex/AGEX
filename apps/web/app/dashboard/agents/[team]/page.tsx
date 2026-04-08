"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EASE_OUT_SMOOTH } from "@/lib/utils";
import { TEAMS } from "@agency/shared/constants";

// Agent data per team (parsed from content files — hardcoded for now, will be API-driven)
const teamAgents: Record<string, string[]> = {
  marketing: ["SEO Specialist", "Social Media Manager", "Email Marketer", "PPC Manager", "PR Specialist", "Influencer Coordinator", "Event Planner", "Affiliate Manager", "Brand Strategist", "Analytics Lead", "CRO Specialist", "Community Manager", "Partnership Lead"],
  sales: ["Cold Email Writer", "Lead Scorer", "Proposal Writer", "Follow-up Automator", "CRM Manager", "Objection Handler", "Sales Script Writer", "Pipeline Analyst", "Account Executive", "SDR Coach"],
  intelligence: ["Competitor Monitor", "News Tracker", "Sentiment Analyst", "Trend Spotter", "Price Monitor", "Review Analyst", "Social Listener", "Market Signal Detector", "Patent Watcher", "Regulatory Monitor"],
  strategy: ["SWOT Analyst", "Positioning Expert", "Pricing Strategist", "GTM Planner", "Market Entry Analyst", "Business Model Designer", "Competitive Strategist"],
  content: ["Blog Writer", "Social Post Creator", "Newsletter Writer", "Case Study Writer", "Script Writer", "Whitepaper Author", "Copywriter", "Content Calendar Planner", "SEO Content Optimizer", "Video Script Writer"],
  research: ["Market Analyst", "Competitor Deep Diver", "Product Researcher", "Company Profiler", "Industry Scanner", "Customer Researcher", "Technology Scout", "Research Compiler"],
  direction: ["OKR Coach", "Roadmap Planner", "Quarterly Planner", "Priority Setter"],
  managing: ["Project Tracker", "Timeline Manager", "Resource Allocator", "Status Reporter"],
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_SMOOTH as any } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamSlug = params.team as string;
  const team = TEAMS[teamSlug as keyof typeof TEAMS];
  const agents = teamAgents[teamSlug] || [];

  if (!team) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-[hsl(var(--muted-foreground))]">Team not found.</p>
      </div>
    );
  }

  const handleAskAgent = (agentName: string) => {
    router.push(
      `/dashboard/chat?run=${encodeURIComponent(`Use the ${agentName} from the ${team.name} team.`)}`
    );
  };

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">{team.name} Team</h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            {team.agentCount} agents
            {team.subTeamCount > 0 && ` · ${team.subTeamCount} sub-teams`}
          </p>
        </div>
      </motion.div>

      {/* Agent Grid */}
      <motion.div variants={stagger} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <motion.div key={agent} variants={fadeUp}>
            <Card glass className="group transition-all hover:scale-[1.01] hover:border-[hsl(var(--primary)/0.3)]">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${team.color}15`, color: team.color }}
                  >
                    <Bot className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {agent}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAskAgent(agent)}
                  className="gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Chat
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
