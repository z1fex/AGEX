import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  extractWikilinks,
  validatePath,
  type VaultDocument,
} from "@agency/shared";

/**
 * Read a markdown file from the vault with frontmatter parsing.
 */
export function readVaultFile(
  filePath: string,
  vaultRoot: string
): VaultDocument {
  const safePath = validatePath(filePath, vaultRoot);
  const raw = fs.readFileSync(safePath, "utf-8");
  const { data, content } = matter(raw);

  const relativePath = path.relative(vaultRoot, safePath);
  const section = relativePath.split(path.sep)[0] || "";
  const title =
    (data.title as string) ||
    content.match(/^#\s+(.+)$/m)?.[1] ||
    path.basename(safePath, ".md");

  const wikilinks = extractWikilinks(content);
  const tags: string[] = Array.isArray(data.tags) ? data.tags : [];
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return {
    path: relativePath.replace(/\\/g, "/"),
    title,
    section,
    frontmatter: data,
    content,
    wikilinks,
    tags,
    wordCount,
    modifiedAt: fs.statSync(safePath).mtimeMs,
  };
}

/**
 * Read all markdown files from a vault directory recursively.
 */
export function readVaultDirectory(vaultRoot: string): VaultDocument[] {
  const docs: VaultDocument[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith(".md")) {
        try {
          const relativePath = path.relative(vaultRoot, fullPath);
          docs.push(readVaultFile(relativePath, vaultRoot));
        } catch {
          // Skip files that can't be parsed
        }
      }
    }
  }

  walk(vaultRoot);
  return docs;
}
