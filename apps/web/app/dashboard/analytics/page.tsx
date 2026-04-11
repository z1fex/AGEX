"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, DollarSign, MessageSquare, Clock, Zap, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EASE_OUT_SMOOTH } from "@/lib/utils";

interface CostSummary {
  totalCost: number;
  totalTokens: number;
  totalChats: number;
  agentsUsed: number;
  avgResponseMs: number;
  costByProvider: Record<string, number>;
  costByTeam: Record<string, number>;
  costByDay: { date: string; cost: number; tokens: number }[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_SMOOTH as any } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

export default function AnalyticsPage() {
  const [data, setData] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[rgb(116,116,116)]" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Cost",
      value: `$${(data?.totalCost || 0).toFixed(4)}`,
      icon: DollarSign,
    },
    {
      label: "Total Tokens",
      value: (data?.totalTokens || 0).toLocaleString(),
      icon: MessageSquare,
    },
    {
      label: "Agent Calls",
      value: String(data?.totalChats || 0),
      icon: Zap,
    },
    {
      label: "Avg Response",
      value: data?.avgResponseMs ? `${(data.avgResponseMs / 1000).toFixed(1)}s` : "0s",
      icon: Clock,
    },
  ];

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold text-white">Analytics</h2>
        <p className="mt-1 text-[rgb(116,116,116)]">Usage and cost tracking (last 30 days).</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <Card glass>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5">
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-[rgb(116,116,116)]">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cost by Provider */}
        <motion.div variants={fadeUp}>
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <DollarSign className="h-4 w-4" /> Cost by Provider
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(data?.costByProvider || {}).length === 0 ? (
                <p className="text-sm text-[rgb(116,116,116)] py-4">No data yet. Start chatting to see costs.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(data!.costByProvider).map(([provider, cost]) => (
                    <div key={provider} className="flex items-center justify-between">
                      <span className="text-sm text-[rgb(200,200,200)] capitalize">{provider}</span>
                      <span className="text-sm font-mono text-white">${cost.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Cost by Team */}
        <motion.div variants={fadeUp}>
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <BarChart3 className="h-4 w-4" /> Usage by Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(data?.costByTeam || {}).length === 0 ? (
                <p className="text-sm text-[rgb(116,116,116)] py-4">No data yet. Run some agents to see team usage.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(data!.costByTeam)
                    .sort((a, b) => b[1] - a[1])
                    .map(([team, cost]) => {
                      const maxCost = Math.max(...Object.values(data!.costByTeam));
                      const pct = maxCost > 0 ? (cost / maxCost) * 100 : 0;
                      return (
                        <div key={team}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-[rgb(200,200,200)] capitalize">{team}</span>
                            <span className="text-xs font-mono text-[rgb(116,116,116)]">${cost.toFixed(4)}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full bg-white/20"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Daily breakdown */}
      {(data?.costByDay?.length || 0) > 0 && (
        <motion.div variants={fadeUp}>
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <BarChart3 className="h-4 w-4" /> Daily Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data!.costByDay.map((day) => (
                  <div key={day.date} className="flex items-center justify-between text-sm">
                    <span className="text-[rgb(116,116,116)]">{day.date}</span>
                    <div className="flex gap-4">
                      <span className="text-[rgb(200,200,200)]">{day.tokens.toLocaleString()} tokens</span>
                      <span className="font-mono text-white">${day.cost.toFixed(4)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
