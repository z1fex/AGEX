"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare, Trash2, X } from "lucide-react";
import { useChatStore } from "@/stores/chat-store";
import { cn } from "@/lib/utils";

export function ThreadList() {
  const { threads, activeThreadId, newThread, switchThread, deleteThread } =
    useChatStore();

  return (
    <div className="flex flex-col h-full">
      {/* New thread button */}
      <button
        onClick={() => newThread()}
        className="flex items-center gap-2 mx-3 mb-3 px-3 py-2 rounded-lg border border-[rgb(30,30,30)] text-sm text-[rgb(160,160,160)] hover:text-white hover:border-[rgb(60,60,60)] transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        New chat
      </button>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto space-y-0.5 px-2">
        <AnimatePresence>
          {threads.map((thread) => (
            <motion.div
              key={thread.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
            >
              <button
                onClick={() => switchThread(thread.id)}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  activeThreadId === thread.id
                    ? "bg-white/5 text-white"
                    : "text-[rgb(116,116,116)] hover:text-[rgb(200,200,200)] hover:bg-white/[0.02]"
                )}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 truncate">{thread.title}</span>

                {/* Delete button (on hover, don't delete last thread) */}
                {threads.length > 1 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteThread(thread.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10"
                  >
                    <X className="h-3 w-3" />
                  </span>
                )}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
