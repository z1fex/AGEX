"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen,
  File,
  ChevronRight,
  ChevronDown,
  Database,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EASE_OUT_SMOOTH } from "@/lib/utils";

// Vault structure mirrors the v2 Obsidian vault
const vaultTree = [
  {
    name: "00-Dashboard",
    type: "folder" as const,
    children: [
      { name: "Agency Dashboard.md", type: "file" as const },
      { name: "ROI Tracker.md", type: "file" as const },
    ],
  },
  {
    name: "01-Clients",
    type: "folder" as const,
    children: [
      { name: "_Client Template.md", type: "file" as const },
    ],
  },
  {
    name: "02-Campaigns",
    type: "folder" as const,
    children: [],
  },
  {
    name: "03-Research",
    type: "folder" as const,
    children: [],
  },
  {
    name: "04-Intelligence",
    type: "folder" as const,
    children: [],
  },
  {
    name: "05-Content",
    type: "folder" as const,
    children: [],
  },
  {
    name: "06-Strategy",
    type: "folder" as const,
    children: [],
  },
  {
    name: "07-Sales",
    type: "folder" as const,
    children: [],
  },
  {
    name: "08-Operations",
    type: "folder" as const,
    children: [],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_SMOOTH as any } },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

function FolderItem({
  item,
  depth = 0,
}: {
  item: (typeof vaultTree)[0];
  depth?: number;
}) {
  const [open, setOpen] = useState(depth === 0);
  const isFolder = item.type === "folder";
  const children = "children" in item ? (item as any).children : [];

  return (
    <div>
      <button
        onClick={() => isFolder && setOpen(!open)}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[hsl(var(--muted)/0.5)] ${
          isFolder
            ? "text-[hsl(var(--foreground))] font-medium"
            : "text-[hsl(var(--muted-foreground))]"
        }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {isFolder ? (
          open ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
          )
        ) : (
          <File className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--muted-foreground))]" />
        )}
        {isFolder ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
        ) : null}
        <span className="truncate">{item.name}</span>
        {isFolder && children.length > 0 && (
          <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">
            {children.length}
          </span>
        )}
      </button>

      {isFolder && open && children.length > 0 && (
        <div>
          {children.map((child: any) => (
            <FolderItem key={child.name} item={child} depth={depth + 1} />
          ))}
        </div>
      )}

      {isFolder && open && children.length === 0 && (
        <p
          className="px-3 py-1.5 text-xs text-[hsl(var(--muted-foreground))] italic"
          style={{ paddingLeft: `${(depth + 1) * 16 + 12}px` }}
        >
          Empty — files appear here after running workflows
        </p>
      )}
    </div>
  );
}

export default function VaultPage() {
  return (
    <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Vault</h2>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          Your agency's knowledge base. Obsidian-compatible markdown files.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* File tree */}
        <motion.div variants={fadeUp} className="lg:col-span-1">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-[hsl(var(--primary))]" />
                Vault Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-0.5">
                {vaultTree.map((item) => (
                  <FolderItem key={item.name} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview area */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card glass className="h-full min-h-[400px]">
            <CardContent className="flex h-full items-center justify-center p-12">
              <div className="text-center">
                <FolderOpen className="mx-auto h-12 w-12 text-[hsl(var(--muted-foreground)/0.3)]" />
                <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
                  Select a file to preview its contents.
                </p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground)/0.6)]">
                  Files are generated when you run workflows through the chat.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
