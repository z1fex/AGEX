"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bot, Loader2, CheckCircle2 } from "lucide-react";
import { EASE_OUT_SMOOTH } from "@/lib/utils";
import type { ExecutionStep } from "@/stores/chat-store";

export function AgentStatusBar({
  steps,
  activeAgents,
}: {
  steps?: ExecutionStep[];
  activeAgents: string[];
}) {
  if (activeAgents.length === 0 && (!steps || steps.length === 0)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT_SMOOTH }}
      className="mx-4 mb-3 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[hsl(var(--muted-foreground))] mb-2">
          <Bot className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
          Active Agents
        </div>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {activeAgents.map((agent) => (
              <motion.div
                key={agent}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--primary)/0.1)] px-3 py-1 text-xs font-medium text-[hsl(var(--primary))]"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                {agent}
              </motion.div>
            ))}
          </AnimatePresence>

          {steps?.filter((s) => s.status === "completed").map((step) => (
            <motion.div
              key={step.agent}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--success)/0.1)] px-3 py-1 text-xs font-medium text-[hsl(var(--success))]"
            >
              <CheckCircle2 className="h-3 w-3" />
              {step.agent}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
