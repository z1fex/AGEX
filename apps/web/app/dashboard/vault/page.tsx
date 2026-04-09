"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderOpen, File, ChevronRight, ChevronDown, Database, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EASE_OUT_SMOOTH } from "@/lib/utils";

interface TreeEntry {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: TreeEntry[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_SMOOTH as any } },
};

export default function VaultPage() {
  const [tree, setTree] = useState<TreeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [loadingFile, setLoadingFile] = useState(false);

  useEffect(() => {
    fetch("/api/vault?action=tree")
      .then((r) => r.json())
      .then((data) => setTree(data.tree || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFileClick = async (filePath: string) => {
    setSelectedFile(filePath);
    setLoadingFile(true);
    try {
      const res = await fetch(`/api/vault?action=file&path=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      setFileContent(data.content || "File not found");
    } catch {
      setFileContent("Failed to load file");
    }
    setLoadingFile(false);
  };

  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h2 className="text-2xl font-bold text-white">Vault</h2>
        <p className="mt-1 text-[rgb(116,116,116)]">
          Your agency's knowledge base. Files are created when agents save outputs.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* File tree */}
        <motion.div variants={fadeUp} className="lg:col-span-1">
          <Card glass>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4 text-white" />
                Vault Files
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-[rgb(116,116,116)]" />
                </div>
              ) : tree.length === 0 ? (
                <p className="px-3 py-4 text-sm text-[rgb(116,116,116)]">
                  Vault is empty. Run an agent from the chat to generate files.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {tree.map((item) => (
                    <FolderItem
                      key={item.name}
                      item={item}
                      selectedFile={selectedFile}
                      onFileClick={handleFileClick}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview */}
        <motion.div variants={fadeUp} className="lg:col-span-2">
          <Card glass className="h-full min-h-[400px]">
            {selectedFile ? (
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2 text-xs text-[rgb(116,116,116)]">
                  <File className="h-3.5 w-3.5" />
                  {selectedFile}
                </div>
                {loadingFile ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-[rgb(116,116,116)]" />
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-[rgb(200,200,200)] leading-relaxed font-mono">
                    {fileContent}
                  </pre>
                )}
              </CardContent>
            ) : (
              <CardContent className="flex h-full items-center justify-center p-12">
                <div className="text-center">
                  <FolderOpen className="mx-auto h-12 w-12 text-[rgb(50,50,50)]" />
                  <p className="mt-4 text-sm text-[rgb(116,116,116)]">
                    Select a file to preview its contents.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

function FolderItem({
  item,
  depth = 0,
  selectedFile,
  onFileClick,
}: {
  item: TreeEntry;
  depth?: number;
  selectedFile: string | null;
  onFileClick: (path: string) => void;
}) {
  const [open, setOpen] = useState(depth === 0);
  const isFolder = item.type === "directory";
  const children = item.children || [];
  const isSelected = selectedFile === item.path;

  return (
    <div>
      <button
        onClick={() => (isFolder ? setOpen(!open) : onFileClick(item.path))}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
          isSelected
            ? "bg-white/5 text-white"
            : isFolder
            ? "text-[rgb(200,200,200)] hover:bg-white/5"
            : "text-[rgb(116,116,116)] hover:bg-white/5 hover:text-white"
        }`}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        {isFolder ? (
          open ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />
        ) : (
          <File className="h-3 w-3 shrink-0" />
        )}
        {isFolder && <FolderOpen className="h-3.5 w-3.5 shrink-0 text-white" />}
        <span className="truncate">{item.name}</span>
        {isFolder && children.length > 0 && (
          <span className="ml-auto text-xs text-[rgb(80,80,80)]">{children.length}</span>
        )}
      </button>

      {isFolder && open && children.map((child) => (
        <FolderItem
          key={child.name}
          item={child}
          depth={depth + 1}
          selectedFile={selectedFile}
          onFileClick={onFileClick}
        />
      ))}

      {isFolder && open && children.length === 0 && (
        <p className="px-3 py-1 text-xs text-[rgb(60,60,60)] italic" style={{ paddingLeft: `${(depth + 1) * 16 + 12}px` }}>
          Empty
        </p>
      )}
    </div>
  );
}
