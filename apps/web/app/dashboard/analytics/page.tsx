"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  DollarSign,
  MessageSquare,
  Clock,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EASE_OUT_SMOOTH } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_SMOOTH as any } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const stats = [
  { label: "Total Chats", value: "0", icon: MessageSquare, color: "text-[hsl(var(--primary))]" },
  { label: "Total Cost", value: "$0.00", icon: DollarSign, color: "text-[#10b981]" },
  { label: "Agents Used", value: "0", icon: Zap, color: "text-[#f59e0b]" },
  { label: "Avg Response", value: "0s", icon: Clock, color: "text-[#22d3ee]" },
];

export default function AnalyticsPage() {
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Analytics</h2>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          Usage tracking, cost monitoring, and performance metrics.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={stagger} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <Card glass>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{stat.value}</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div variants={fadeUp}>
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-[hsl(var(--primary))]" />
                Cost Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border))]">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Chart data will appear after using the agency.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-[hsl(var(--primary))]" />
                Usage by Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border))]">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Chart data will appear after using the agency.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
