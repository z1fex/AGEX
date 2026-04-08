"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Bell } from "lucide-react";
import { EASE_OUT_SMOOTH } from "@/lib/utils";

const routeTitles: Record<string, string> = {
  "/dashboard/chat": "AGEX Chat",
  "/dashboard": "Dashboard",
  "/dashboard/clients": "Clients",
  "/dashboard/agents": "Agents",
  "/dashboard/workflows": "Workflows",
  "/dashboard/vault": "Vault",
  "/dashboard/outputs": "Outputs",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();

  const title =
    Object.entries(routeTitles).find(([route]) =>
      pathname.startsWith(route) && route === pathname.split("/").slice(0, route.split("/").length).join("/")
    )?.[1] || routeTitles[pathname] || "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.8)] backdrop-blur-xl px-6">
      {/* Title with page transition */}
      <motion.h1
        key={pathname}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: EASE_OUT_SMOOTH }}
        className="text-lg font-semibold text-[hsl(var(--foreground))]"
      >
        {title}
      </motion.h1>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Search trigger (Cmd+K placeholder) */}
        <button className="flex h-9 items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.5)] px-3 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-1.5 text-[10px] font-mono text-[hsl(var(--muted-foreground))]">
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]">
          <Bell className="h-4 w-4" />
        </button>

        {/* Avatar placeholder */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--glow-secondary))]" />
      </div>
    </header>
  );
}
