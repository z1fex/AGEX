"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useChatStore } from "@/stores/chat-store";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { AgentStatusBar } from "@/components/chat/agent-status-bar";

const SETTINGS_KEY = "agency-llm-settings";
const ACTIVE_KEY = "agency-active-provider";

// Provider base URLs for display
const PROVIDER_NAMES: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  groq: "Groq",
  openrouter: "OpenRouter",
  ollama: "Ollama",
};

function getProviderConfig() {
  try {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    const activeProvider = localStorage.getItem(ACTIVE_KEY) || "openai";

    // First try the active provider
    const activeConfig = settings[activeProvider];
    if (activeConfig?.apiKey || activeProvider === "ollama") {
      return {
        provider: activeProvider,
        apiKey: activeConfig?.apiKey || "",
        model: activeConfig?.model || "",
        baseUrl: activeConfig?.baseUrl || "",
      };
    }

    // Auto-detect: find ANY provider that has an API key configured
    for (const [id, config] of Object.entries(settings)) {
      const c = config as any;
      if (c?.apiKey && id !== "_active") {
        // Auto-switch to this provider
        localStorage.setItem(ACTIVE_KEY, id);
        return {
          provider: id,
          apiKey: c.apiKey,
          model: c.model || "",
          baseUrl: c.baseUrl || "",
        };
      }
    }

    return { provider: activeProvider, apiKey: "", model: "", baseUrl: "" };
  } catch {
    return { provider: "openai", apiKey: "", model: "", baseUrl: "" };
  }
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-4rem)] items-center justify-center text-[hsl(var(--muted-foreground))]">Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}

function ChatContent() {
  const {
    messages,
    isProcessing,
    activeAgents,
    addMessage,
    updateMessage,
    setProcessing,
    setActiveAgents,
  } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const autoSentRef = useRef(false);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // Auto-send if redirected from workflow/agent page with ?run= parameter
  useEffect(() => {
    const runMessage = searchParams.get("run");
    if (runMessage && !autoSentRef.current && !isProcessing) {
      autoSentRef.current = true;
      // Small delay so the page renders first
      setTimeout(() => handleSend(runMessage), 500);
    }
  }, [searchParams]);

  const handleSend = async (content: string) => {
    // Add user message
    addMessage({ role: "user", content });
    setProcessing(true);

    const config = getProviderConfig();

    if (!config.apiKey && config.provider !== "ollama") {
      addMessage({
        role: "assistant",
        content: `**No API key found.**\n\nI checked all providers and couldn't find a saved API key.\n\n**To fix this:**\n1. Click **Settings** in the sidebar\n2. Pick your provider (Groq is free & fast)\n3. Paste your API key\n4. Click **Save Settings**\n5. Come back here and chat\n\nSupported: OpenAI, Anthropic, Google, **Groq (free)**, OpenRouter, Ollama (local).`,
      });
      setProcessing(false);
      return;
    }

    if (!config.model) {
      addMessage({
        role: "assistant",
        content: `**No model selected for ${PROVIDER_NAMES[config.provider] || config.provider}.** Go to Settings and pick a model.`,
      });
      setProcessing(false);
      return;
    }

    // Create placeholder for streaming response
    const assistantId = addMessage({
      role: "assistant",
      content: "",
      isStreaming: true,
    });

    setActiveAgents(["Agency Brain"]);

    try {
      // Build conversation history (last 20 messages for context window)
      const history = messages
        .filter((m) => m.role !== "system")
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));
      history.push({ role: "user", content });

      // Call the REAL API
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          provider: config.provider,
          apiKey: config.apiKey,
          model: config.model,
          baseUrl: config.baseUrl,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        updateMessage(assistantId, {
          content: `**Error:** ${err.error || res.statusText}`,
          isStreaming: false,
        });
        setProcessing(false);
        setActiveAgents([]);
        return;
      }

      // Stream the response
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        updateMessage(assistantId, {
          content: fullContent,
          isStreaming: true,
        });

        // Auto-scroll
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }

      updateMessage(assistantId, {
        content: fullContent,
        isStreaming: false,
      });
    } catch (err: any) {
      updateMessage(assistantId, {
        content: `**Connection error:** ${err.message}\n\nMake sure your API key is valid and the provider is reachable.`,
        isStreaming: false,
      });
    }

    setProcessing(false);
    setActiveAgents([]);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
      </div>

      {/* Active agents */}
      <AnimatePresence>
        {activeAgents.length > 0 && (
          <AgentStatusBar activeAgents={activeAgents} />
        )}
      </AnimatePresence>

      {/* Input */}
      <ChatInput onSend={handleSend} isProcessing={isProcessing} />
    </div>
  );
}
