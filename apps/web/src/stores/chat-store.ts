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

export interface Thread {
  id: string;
  title: string;
  clientSlug?: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "**AGEX** — your AI agency.\n\n8 teams. 113+ agents. Tell me what you need.\n\n- *\"Write cold outreach emails for enterprise CTOs\"*\n- *\"Create a content strategy for my coffee brand\"*\n- *\"Analyze my top 3 competitors\"*\n- *\"Build a go-to-market plan for my SaaS\"*\n- *\"Onboard a new client\"*",
  timestamp: Date.now(),
};

function createThread(title = "New chat"): Thread {
  return {
    id: crypto.randomUUID(),
    title,
    messages: [{ ...WELCOME_MESSAGE, id: `welcome-${Date.now()}`, timestamp: Date.now() }],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

interface ChatStore {
  // Thread management
  threads: Thread[];
  activeThreadId: string | null;

  // Current thread's transient state
  isProcessing: boolean;
  activeAgents: string[];

  // Thread actions
  newThread: (title?: string, clientSlug?: string) => string;
  switchThread: (id: string) => void;
  deleteThread: (id: string) => void;
  renameThread: (id: string, title: string) => void;

  // Message actions (on active thread)
  getMessages: () => ChatMessage[];
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setProcessing: (processing: boolean) => void;
  setActiveAgents: (agents: string[]) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => {
      const defaultThread = createThread("Welcome");

      return {
        threads: [defaultThread],
        activeThreadId: defaultThread.id,
        isProcessing: false,
        activeAgents: [],

        // --- Thread actions ---

        newThread: (title, clientSlug) => {
          const thread = createThread(title || "New chat");
          if (clientSlug) thread.clientSlug = clientSlug;
          set((s) => ({
            threads: [thread, ...s.threads].slice(0, 50), // max 50 threads
            activeThreadId: thread.id,
            isProcessing: false,
            activeAgents: [],
          }));
          return thread.id;
        },

        switchThread: (id) => {
          set({ activeThreadId: id, isProcessing: false, activeAgents: [] });
        },

        deleteThread: (id) => {
          set((s) => {
            const remaining = s.threads.filter((t) => t.id !== id);
            if (remaining.length === 0) {
              const fresh = createThread("New chat");
              return { threads: [fresh], activeThreadId: fresh.id };
            }
            return {
              threads: remaining,
              activeThreadId:
                s.activeThreadId === id ? remaining[0].id : s.activeThreadId,
            };
          });
        },

        renameThread: (id, title) => {
          set((s) => ({
            threads: s.threads.map((t) =>
              t.id === id ? { ...t, title } : t
            ),
          }));
        },

        // --- Message actions (on active thread) ---

        getMessages: () => {
          const { threads, activeThreadId } = get();
          return threads.find((t) => t.id === activeThreadId)?.messages || [];
        },

        addMessage: (message) => {
          const msgId = crypto.randomUUID();
          set((s) => {
            const threadIdx = s.threads.findIndex(
              (t) => t.id === s.activeThreadId
            );
            if (threadIdx === -1) return s;

            const thread = s.threads[threadIdx];
            const newMsg: ChatMessage = {
              ...message,
              id: msgId,
              timestamp: Date.now(),
            };

            // Auto-title from first user message
            let title = thread.title;
            if (
              title === "New chat" &&
              message.role === "user" &&
              thread.messages.length <= 1
            ) {
              title = message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "");
            }

            const updated = { ...thread, title, messages: [...thread.messages, newMsg], updatedAt: Date.now() };
            const threads = [...s.threads];
            threads[threadIdx] = updated;

            // Move active thread to top
            threads.sort((a, b) => b.updatedAt - a.updatedAt);

            return { threads };
          });
          return msgId;
        },

        updateMessage: (id, updates) => {
          set((s) => ({
            threads: s.threads.map((t) =>
              t.id === s.activeThreadId
                ? {
                    ...t,
                    messages: t.messages.map((m) =>
                      m.id === id ? { ...m, ...updates } : m
                    ),
                    updatedAt: Date.now(),
                  }
                : t
            ),
          }));
        },

        setProcessing: (processing) => set({ isProcessing: processing }),
        setActiveAgents: (agents) => set({ activeAgents: agents }),

        clearChat: () => {
          set((s) => ({
            threads: s.threads.map((t) =>
              t.id === s.activeThreadId
                ? {
                    ...t,
                    messages: [
                      {
                        ...WELCOME_MESSAGE,
                        id: `welcome-${Date.now()}`,
                        content: "Chat cleared. What can I help you with?",
                        timestamp: Date.now(),
                      },
                    ],
                    updatedAt: Date.now(),
                  }
                : t
            ),
          }));
        },
      };
    },
    {
      name: "agency-chat-history",
      partialize: (state) => ({
        threads: state.threads.map((t) => ({
          ...t,
          messages: t.messages.filter((m) => !m.isStreaming).slice(-100), // max 100 messages per thread
        })),
        activeThreadId: state.activeThreadId,
      }),
    }
  )
);
