"use client";

import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { cn, EASE_OUT_SMOOTH } from "@/lib/utils";
import type { ChatMessage } from "@/stores/chat-store";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT_SMOOTH }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isUser
            ? "bg-[hsl(var(--primary))]"
            : "bg-gradient-to-br from-[#6366f1] to-[#22d3ee]"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Message */}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-white text-black rounded-tr-md"
            : "glass-refract text-white rounded-tl-md"
        )}
      >
        {/* Render markdown-like content */}
        <div
          className="prose-invert prose-sm [&_strong]:text-[hsl(var(--foreground))] [&_em]:text-[hsl(var(--muted-foreground))] [&_code]:bg-[hsl(var(--muted))] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs"
          dangerouslySetInnerHTML={{
            __html: simpleMarkdown(message.content),
          }}
        />

        {/* Streaming indicator */}
        {message.isStreaming && (
          <span className="inline-flex gap-1 ml-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] animate-pulse [animation-delay:0.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] animate-pulse [animation-delay:0.4s]" />
          </span>
        )}
      </div>
    </motion.div>
  );
}

/** Simple markdown → HTML (bold, italic, code, lists, line breaks) */
function simpleMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>")
    .replace(/\n/g, "<br/>");
}
