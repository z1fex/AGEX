"use client";

import { motion } from "framer-motion";
import { Bot, User, Save } from "lucide-react";
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
          isUser ? "bg-white" : "border border-[rgb(45,45,45)] bg-black"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-black" />
        ) : (
          <span className="text-xs">✦</span>
        )}
      </div>

      {/* Message */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed",
          isUser
            ? "bg-white text-black rounded-tr-md"
            : "bg-[rgb(12,12,12)] border border-[rgb(30,30,30)] text-[rgb(220,220,220)] rounded-tl-md"
        )}
      >
        <div
          className={cn(
            "prose-sm max-w-none",
            !isUser && [
              "[&_strong]:text-white [&_strong]:font-semibold",
              "[&_em]:text-[rgb(116,116,116)]",
              "[&_code]:bg-[rgb(30,30,30)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:text-[rgb(200,200,200)]",
              "[&_h3]:text-white [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2",
              "[&_h2]:text-white [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2",
              "[&_hr]:border-[rgb(40,40,40)] [&_hr]:my-3",
              "[&_ul]:space-y-1 [&_ul]:my-2",
              "[&_li]:text-[rgb(180,180,180)]",
              "[&_ol]:space-y-1 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-4",
              "[&_p]:my-1.5",
              "[&_.vault-save]:text-[rgb(80,80,80)] [&_.vault-save]:text-xs [&_.vault-save]:italic",
            ].join(" ")
          )}
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(message.content),
          }}
        />

        {/* Streaming dots */}
        {message.isStreaming && (
          <span className="inline-flex gap-1 ml-1 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse [animation-delay:0.2s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-pulse [animation-delay:0.4s]" />
          </span>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Render markdown to HTML — handles headers, bold, italic, code,
 * lists, dividers, vault save notices, and line breaks.
 */
function renderMarkdown(text: string): string {
  return (
    text
      // Headers (### before ## before #)
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      // Horizontal rules
      .replace(/^---+$/gm, '<hr/>')
      // Bold + italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Vault save notices
      .replace(
        /\*Saved to vault: `(.+?)`\*/g,
        '<p class="vault-save">✓ Saved to vault: $1</p>'
      )
      // Cost/token info
      .replace(
        /\*— (.+?) complete \((\d+) tokens, \$([0-9.]+)\)\*/g,
        '<p class="vault-save">✓ $1 — $2 tokens, $$3</p>'
      )
      .replace(
        /\*Total: (\d+) tokens, \$([0-9.]+), ([0-9.]+)s\*/g,
        '<p class="vault-save">Total: $1 tokens, $$2, $3s</p>'
      )
      // Unordered lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Ordered lists
      .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
      // Wrap consecutive <li> in <ul>
      .replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>')
      // Line breaks (but not after block elements)
      .replace(/\n(?!<[hul\/])/g, '<br/>')
      // Clean up double <br/>
      .replace(/<br\/>\s*<br\/>/g, '<br/>')
  );
}
