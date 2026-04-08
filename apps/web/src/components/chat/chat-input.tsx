"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  isProcessing: boolean;
}

export function ChatInput({ onSend, isProcessing }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isProcessing) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background)/0.8)] backdrop-blur-xl p-4">
      <div className="mx-auto max-w-3xl">
        <div className="relative flex items-end gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 transition-colors focus-within:border-[hsl(var(--primary)/0.4)] focus-within:shadow-[0_0_15px_-5px_hsl(var(--glow)/0.2)]">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isProcessing
                ? "Agents are working..."
                : "Tell your agency what you need..."
            }
            disabled={isProcessing}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none disabled:opacity-50"
          />

          {/* Send button */}
          <motion.button
            onClick={handleSubmit}
            disabled={!value.trim() || isProcessing}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all",
              value.trim() && !isProcessing
                ? "bg-[hsl(var(--primary))] text-white shadow-[0_0_10px_hsl(var(--glow)/0.3)] cursor-pointer"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
            )}
            whileHover={
              value.trim() && !isProcessing ? { scale: 1.05 } : undefined
            }
            whileTap={
              value.trim() && !isProcessing ? { scale: 0.95 } : undefined
            }
          >
            {isProcessing ? (
              <Sparkles className="h-4 w-4 animate-pulse" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </motion.button>
        </div>

        <p className="mt-2 text-center text-[10px] text-[hsl(var(--muted-foreground))]">
          Your agency deploys the right agents automatically. Shift+Enter for new line.
        </p>
      </div>
    </div>
  );
}
