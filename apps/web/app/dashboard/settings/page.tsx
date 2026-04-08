"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Check, AlertCircle, Zap, TestTube } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EASE_OUT_SMOOTH } from "@/lib/utils";

const providers = [
  {
    id: "openai",
    name: "OpenAI",
    placeholder: "sk-...",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o3-mini"],
    defaultModel: "gpt-4o",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    placeholder: "sk-ant-...",
    models: ["claude-sonnet-4-20250514", "claude-haiku-4-5-20251001", "claude-opus-4-20250514"],
    defaultModel: "claude-sonnet-4-20250514",
  },
  {
    id: "google",
    name: "Google",
    placeholder: "AIza...",
    models: ["gemini-2.5-pro", "gemini-2.5-flash"],
    defaultModel: "gemini-2.5-flash",
  },
  {
    id: "groq",
    name: "Groq (Free & Fast)",
    placeholder: "gsk_...",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
    defaultModel: "llama-3.3-70b-versatile",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    placeholder: "sk-or-...",
    models: [
      "anthropic/claude-sonnet-4",
      "openai/gpt-4o",
      "google/gemini-2.5-pro",
      "meta-llama/llama-3.1-405b-instruct",
      "mistralai/mistral-large",
      "deepseek/deepseek-chat-v3",
      "qwen/qwen-2.5-72b-instruct",
    ],
    defaultModel: "anthropic/claude-sonnet-4",
  },
  {
    id: "ollama",
    name: "Ollama (Local & Free)",
    placeholder: "No key needed",
    models: ["llama3.1", "mistral", "qwen2.5", "deepseek-r1", "phi4"],
    defaultModel: "llama3.1",
    hasBaseUrl: true,
  },
];

interface ProviderConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  status: "untested" | "testing" | "connected" | "failed";
}

const STORAGE_KEY = "agency-llm-settings";
const ACTIVE_KEY = "agency-active-provider";

function loadSettings(): Record<string, ProviderConfig> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export default function SettingsPage() {
  const [configs, setConfigs] = useState<Record<string, ProviderConfig>>({});
  const [activeProvider, setActiveProvider] = useState("openai");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfigs(loadSettings());
    setActiveProvider(localStorage.getItem(ACTIVE_KEY) || "openai");
  }, []);

  const getConfig = (id: string): ProviderConfig =>
    configs[id] || {
      apiKey: "",
      model: providers.find((p) => p.id === id)?.defaultModel || "",
      baseUrl: id === "ollama" ? "http://localhost:11434" : "",
      status: "untested",
    };

  const updateConfig = (id: string, updates: Partial<ProviderConfig>) => {
    setConfigs((prev) => ({
      ...prev,
      [id]: { ...getConfig(id), ...updates },
    }));
  };

  const handleSave = () => {
    // Auto-detect active provider: use whichever one has a key
    let providerToSave = activeProvider;
    if (!configs[activeProvider]?.apiKey && activeProvider !== "ollama") {
      for (const p of providers) {
        if (configs[p.id]?.apiKey) {
          providerToSave = p.id;
          setActiveProvider(p.id);
          break;
        }
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
    localStorage.setItem(ACTIVE_KEY, providerToSave);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT_SMOOTH }}
      className="max-w-3xl space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          LLM Settings
        </h2>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          Add your API key. This model becomes the brain that reads your 113
          agents and runs the agency.
        </p>
      </div>

      {/* Active provider */}
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-[hsl(var(--primary))]" />
            Active Provider
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProvider(p.id)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  activeProvider === p.id
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] glow-border"
                    : "border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--border-hover))]"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Provider configs */}
      {providers.map((provider) => {
        const config = getConfig(provider.id);
        return (
          <Card key={provider.id} glass>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  {provider.name}
                </span>
                {config.status === "connected" && (
                  <span className="flex items-center gap-1 text-xs text-[hsl(var(--success))]">
                    <Check className="h-3 w-3" /> Connected
                  </span>
                )}
                {config.status === "failed" && (
                  <span className="flex items-center gap-1 text-xs text-[hsl(var(--destructive))]">
                    <AlertCircle className="h-3 w-3" /> Failed
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* API Key */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  {provider.id === "ollama" ? "Base URL" : "API Key"}
                </label>
                <input
                  type={provider.id === "ollama" ? "text" : "password"}
                  value={provider.id === "ollama" ? config.baseUrl : config.apiKey}
                  onChange={(e) => {
                    updateConfig(
                      provider.id,
                      provider.id === "ollama"
                        ? { baseUrl: e.target.value }
                        : { apiKey: e.target.value }
                    );
                    // Auto-select this provider when user types a key
                    if (e.target.value.length > 5) setActiveProvider(provider.id);
                  }}
                  placeholder={provider.placeholder}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground)/0.5)] focus:border-[hsl(var(--primary)/0.4)] focus:outline-none focus:ring-[3px] focus:ring-[hsl(var(--primary)/0.1)]"
                />
              </div>

              {/* Model */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[hsl(var(--muted-foreground))]">
                  Model
                </label>
                <select
                  value={config.model}
                  onChange={(e) =>
                    updateConfig(provider.id, { model: e.target.value })
                  }
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary)/0.4)] focus:outline-none"
                >
                  {provider.models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Save */}
      <Button onClick={handleSave} size="lg" className="w-full">
        {saved ? (
          <span className="flex items-center gap-2">
            <Check className="h-4 w-4" /> Saved!
          </span>
        ) : (
          "Save Settings"
        )}
      </Button>
    </motion.div>
  );
}
