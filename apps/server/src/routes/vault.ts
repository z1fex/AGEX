import { Hono } from "hono";
import path from "node:path";
import fs from "node:fs";
import { readVaultFile, readVaultDirectory } from "@agency/vault-engine";
import { validatePath, type VaultFileEntry } from "@agency/shared";

const VAULT_ROOT = path.resolve(process.cwd(), "vault");

export const vaultRouter = new Hono();

// Get vault file tree
vaultRouter.get("/tree", (c) => {
  function buildTree(dir: string): VaultFileEntry[] {
    if (!fs.existsSync(dir)) return [];

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries
      .filter((e) => !e.name.startsWith(".") && !e.isSymbolicLink())
      .filter((e) => e.isDirectory() || e.name.endsWith(".md"))
      .map((e) => {
        const relativePath = path
          .relative(VAULT_ROOT, path.join(dir, e.name))
          .replace(/\\/g, "/");
        if (e.isDirectory()) {
          return {
            name: e.name,
            type: "directory" as const,
            path: relativePath,
            children: buildTree(path.join(dir, e.name)),
          };
        }
        return {
          name: e.name,
          type: "file" as const,
          path: relativePath,
        };
      });
  }

  return c.json({ tree: buildTree(VAULT_ROOT) });
});

// Read a vault file
vaultRouter.get("/file", (c) => {
  const filePath = c.req.query("path");
  if (!filePath) {
    return c.json({ error: "path query parameter required" }, 400);
  }

  try {
    const doc = readVaultFile(filePath, VAULT_ROOT);
    return c.json(doc);
  } catch (err) {
    if ((err as Error).name === "PathTraversalError") {
      return c.json({ error: "Invalid file path" }, 403);
    }
    return c.json({ error: "File not found" }, 404);
  }
});

// List all vault documents
vaultRouter.get("/all", (c) => {
  const docs = readVaultDirectory(VAULT_ROOT);
  return c.json({
    total: docs.length,
    documents: docs.map((d) => ({
      path: d.path,
      title: d.title,
      section: d.section,
      tags: d.tags,
      wordCount: d.wordCount,
    })),
  });
});
