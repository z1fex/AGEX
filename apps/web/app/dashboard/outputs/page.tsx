"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileOutput, Calendar, Bot, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EASE_OUT_SMOOTH } from "@/lib/utils";

interface OutputEntry {
  id: string;
  title: string;
  agent: string;
  team: string;
  client: string;
  date: string;
  path: string;
  wordCount: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_SMOOTH as any } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

export default function OutputsPage() {
  const [outputs, setOutputs] = useState<OutputEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/outputs")
      .then((r) => r.json())
      .then((data) => setOutputs(data.outputs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold text-white">Outputs</h2>
        <p className="mt-1 text-[rgb(116,116,116)]">
          {outputs.length === 0
            ? "Deliverables appear here when agents save their work."
            : `${outputs.length} deliverable${outputs.length > 1 ? "s" : ""} generated.`}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-[rgb(116,116,116)]" />
        </div>
      ) : outputs.length === 0 ? (
        <motion.div variants={fadeUp}>
          <Card glass className="p-12">
            <div className="flex flex-col items-center text-center">
              <FileOutput className="h-12 w-12 text-[rgb(50,50,50)]" />
              <h3 className="mt-4 text-lg font-semibold text-white">No outputs yet</h3>
              <p className="mt-2 max-w-sm text-sm text-[rgb(116,116,116)]">
                Ask AGEX to create content, reports, or strategies in the chat. Agent outputs will be saved here automatically.
              </p>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={stagger} className="space-y-3">
          {outputs.map((output) => (
            <motion.div key={output.id} variants={fadeUp}>
              <Card glass className="transition-all hover:border-white/10">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                    <FileOutput className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{output.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[rgb(116,116,116)]">
                      <span className="flex items-center gap-1">
                        <Bot className="h-3 w-3" /> {output.agent}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {output.date}
                      </span>
                      <span>{output.wordCount} words</span>
                    </div>
                  </div>
                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-[rgb(116,116,116)]">
                    {output.team}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
