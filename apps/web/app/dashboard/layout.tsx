"use client";

import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useSidebarStore } from "@/stores/sidebar-store";
import { EASE_OUT_SMOOTH } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebarStore();

  return (
    <div className="min-h-screen">
      <Sidebar />

      {/* Main content — shifts based on sidebar width */}
      <motion.main
        animate={{ marginLeft: isCollapsed ? 72 : 280 }}
        transition={{ duration: 0.3, ease: EASE_OUT_SMOOTH }}
        className="flex min-h-screen flex-col"
      >
        <Header />

        <div className="flex-1 p-6">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
