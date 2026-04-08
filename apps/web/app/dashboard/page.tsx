"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Workflow,
  Users,
  FileOutput,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";
import { EASE_OUT_SMOOTH } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: EASE_OUT_SMOOTH },
  },
};

const stats = [
  {
    label: "Total Agents",
    value: "113+",
    icon: Bot,
    color: "text-[#6366f1]",
    glowClass: "glass-glow-purple",
  },
  {
    label: "Workflows",
    value: "9",
    icon: Workflow,
    color: "text-[#22d3ee]",
    glowClass: "glass-glow-cyan",
  },
  {
    label: "Active Clients",
    value: "0",
    icon: Users,
    color: "text-[#10b981]",
    glowClass: "",
  },
  {
    label: "Deliverables",
    value: "0",
    icon: FileOutput,
    color: "text-[#f59e0b]",
    glowClass: "",
  },
];

const quickActions = [
  {
    label: "Onboard Client",
    description: "Run the 5-phase interview",
    icon: Users,
    href: "/dashboard/clients/new",
  },
  {
    label: "Run Workflow",
    description: "Execute a pre-built workflow",
    icon: Workflow,
    href: "/dashboard/workflows",
  },
  {
    label: "Browse Agents",
    description: "Explore 113+ AI agents",
    icon: Bot,
    href: "/dashboard/agents",
  },
  {
    label: "Configure LLM",
    description: "Set up your LLM provider",
    icon: Zap,
    href: "/dashboard/settings",
  },
];

const recentActivity = [
  {
    action: "System initialized",
    detail: "Agency in a Box v3 is ready",
    time: "Just now",
    icon: Zap,
  },
  {
    action: "Content layer loaded",
    detail: "105 agent & workflow files parsed",
    time: "Just now",
    icon: Bot,
  },
  {
    action: "8 teams available",
    detail: "Marketing, Sales, Intelligence, Research, Strategy, Content, Direction, Managing",
    time: "Just now",
    icon: TrendingUp,
  },
];

export default function DashboardPage() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="space-y-8"
    >
      {/* Welcome */}
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold text-white">
          AGEX
        </h2>
        <p className="mt-1 text-[rgb(116,116,116)]">
          8 teams. 113+ agents. 9 workflows.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={stagger}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <Card
              glass
              className={`group cursor-default transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_-5px_hsl(var(--glow)/0.3)] ${stat.glowClass}`}
            >
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))] ${stat.color}`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <motion.p
                    className="text-2xl font-bold text-[hsl(var(--foreground))]"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Two-column: Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Quick Actions */}
        <motion.div variants={fadeUp} className="lg:col-span-3">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[hsl(var(--primary))]" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {quickActions.map((action) => (
                  <motion.a
                    key={action.label}
                    href={action.href}
                    className="group flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 transition-all hover:border-[hsl(var(--primary)/0.3)] hover:bg-[hsl(var(--card-hover))]"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--primary))]">
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {action.label}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
                  </motion.a>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex gap-3"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.4 + i * 0.1,
                      duration: 0.3,
                      ease: EASE_OUT_SMOOTH,
                    }}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                        {item.action}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                        {item.detail}
                      </p>
                    </div>
                    <span className="ml-auto whitespace-nowrap text-xs text-[hsl(var(--muted-foreground))]">
                      {item.time}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
