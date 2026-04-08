import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  agentsUsed?: string[];
  isStreaming?: boolean;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "**AGEX v1** — your AI agency.\n\n8 teams. 113+ agents. Tell me what you need.\n\n- *\"Write cold outreach emails for enterprise CTOs\"*\n- *\"Create a content strategy for my coffee brand\"*\n- *\"Analyze my top 3 competitors\"*\n- *\"Build a go-to-market plan for my SaaS\"*\n- *\"Onboard a new client\"*",
  timestamp: Date.now(),
};

interface ChatStore {
  messages: ChatMessage[];
  isProcessing: boolean;
  activeAgents: string[];
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setProcessing: (processing: boolean) => void;
  setActiveAgents: (agents: string[]) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [WELCOME_MESSAGE],
      isProcessing: false,
      activeAgents: [],

      addMessage: (message) => {
        const id = crypto.randomUUID();
        set((s) => ({
          messages: [...s.messages, { ...message, id, timestamp: Date.now() }],
        }));
        return id;
      },

      updateMessage: (id, updates) => {
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
      },

      setProcessing: (processing) => set({ isProcessing: processing }),
      setActiveAgents: (agents) => set({ activeAgents: agents }),
      clearChat: () =>
        set({
          messages: [
            {
              ...WELCOME_MESSAGE,
              id: "welcome-" + Date.now(),
              content: "Chat cleared. What can I help you with?",
              timestamp: Date.now(),
            },
          ],
          isProcessing: false,
          activeAgents: [],
        }),
    }),
    {
      name: "agency-chat-history",
      // Only persist messages, not transient state
      partialize: (state) => ({
        messages: state.messages.filter((m) => !m.isStreaming),
      }),
    }
  )
);
