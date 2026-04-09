import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";

const VAULT_ROOT = path.resolve(process.cwd(), "../../vault");

/**
 * GET /api/vault?action=tree — returns the vault file tree
 * GET /api/vault?action=file&path=... — returns a file's content
 */
export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action") || "tree";

  if (action === "tree") {
    return Response.json({ tree: buildTree(VAULT_ROOT) });
  }

  if (action === "file") {
    const filePath = req.nextUrl.searchParams.get("path");
    if (!filePath) {
      return Response.json({ error: "path required" }, { status: 400 });
    }

    // Path traversal protection
    const resolved = path.resolve(VAULT_ROOT, filePath);
    if (!resolved.startsWith(VAULT_ROOT)) {
      return Response.json({ error: "Invalid path" }, { status: 403 });
    }

    try {
      const content = fs.readFileSync(resolved, "utf-8");
      return Response.json({ path: filePath, content });
    } catch {
      return Response.json({ error: "File not found" }, { status: 404 });
    }
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

interface TreeEntry {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: TreeEntry[];
}

function buildTree(dir: string): TreeEntry[] {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => !e.name.startsWith("."))
    .filter((e) => e.isDirectory() || e.name.endsWith(".md"))
    .map((e) => {
      const fullPath = path.join(dir, e.name);
      const relativePath = path.relative(VAULT_ROOT, fullPath).replace(/\\/g, "/");

      if (e.isDirectory()) {
        return {
          name: e.name,
          type: "directory" as const,
          path: relativePath,
          children: buildTree(fullPath),
        };
      }
      return {
        name: e.name,
        type: "file" as const,
        path: relativePath,
      };
    });
}
