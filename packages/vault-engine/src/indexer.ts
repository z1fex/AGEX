import crypto from "node:crypto";
import type { VaultDocument } from "@agency/shared";

/**
 * Generate a content hash for change detection.
 */
export function contentHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
}

/**
 * Convert a VaultDocument to a vault_index row shape.
 */
export function toIndexRow(doc: VaultDocument) {
  return {
    id: crypto.randomUUID(),
    path: doc.path,
    title: doc.title,
    section: doc.section,
    frontmatter: JSON.stringify(doc.frontmatter),
    wikilinks: JSON.stringify(doc.wikilinks),
    tags: JSON.stringify(doc.tags),
    wordCount: doc.wordCount,
    contentHash: contentHash(doc.content),
    modifiedAt: Math.floor(doc.modifiedAt),
    indexedAt: Date.now(),
  };
}
