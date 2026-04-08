"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  LayoutDashboard,
  Users,
  Bot,
  FolderOpen,
  FileOutput,
  BarChart3,
  Settings,
  ChevronLeft,
  Rocket,
} from "lucide-react";
import { cn, EASE_OUT_SMOOTH } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebar-store";

const navItems = [
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare, primary: true },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/agents", label: "Agents", icon: Bot },
  { href: "/dashboard/vault", label: "Vault", icon: FolderOpen },
  { href: "/dashboard/outputs", label: "Outputs", icon: FileOutput },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

const bottomItems = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebarStore();

  return (
    <motion.aside
      className="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--background-secondary))]"
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ duration: 0.3, ease: EASE_OUT_SMOOTH }}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-[hsl(var(--border))] px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <span className="text-base">✦</span>
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: EASE_OUT_SMOOTH }}
              className="overflow-hidden"
            >
              <span className="whitespace-nowrap text-sm font-black tracking-tight text-white">
                AGEX
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(item.href));
          return (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActive}
              isCollapsed={isCollapsed}
            />
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-[hsl(var(--border))] px-3 py-3 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActive}
              isCollapsed={isCollapsed}
            />
          );
        })}

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_SMOOTH }}
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  isActive,
  isCollapsed,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        isActive
          ? "text-[hsl(var(--foreground))]"
          : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      )}
    >
      {/* Active background with glow */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg bg-[hsl(var(--muted))] glow-border"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}

      {/* Hover background */}
      {!isActive && (
        <div className="absolute inset-0 rounded-lg bg-transparent transition-colors group-hover:bg-[hsl(var(--muted)/0.5)]" />
      )}

      <Icon className="relative z-10 h-4 w-4 shrink-0" />

      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT_SMOOTH }}
            className="relative z-10 whitespace-nowrap overflow-hidden"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
