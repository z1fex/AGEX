"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";

export function AgentStatusBar({
  activeAgents,
  completedAgents,
}: {
  activeAgents: string[];
  completedAgents?: string[];
}) {
  const completed = completedAgents || [];
  if (activeAgents.length === 0 && completed.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-4 mb-3 overflow-hidden rounded-xl border border-[rgb(30,30,30)] bg-[rgb(8,8,8)]"
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[rgb(80,80,80)] mb-2">
          ✦ Active Agents
        </div>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {activeAgents.map((agent) => (
              <motion.div
                key={`active-${agent}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-[rgb(40,40,40)] px-3 py-1 text-xs font-medium text-white"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                {agent}
              </motion.div>
            ))}
            {completed.map((agent) => (
              <motion.div
                key={`done-${agent}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-[rgb(40,40,40)] px-3 py-1 text-xs font-medium text-[rgb(100,100,100)]"
              >
                <CheckCircle2 className="h-3 w-3" />
                {agent}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
