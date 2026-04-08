import type { VaultDocument, VaultGraph, VaultNode, VaultEdge } from "@agency/shared";

/**
 * Build a graph from vault documents based on wikilink connections.
 */
export function buildVaultGraph(docs: VaultDocument[]): VaultGraph {
  const pathToDoc = new Map<string, VaultDocument>();
  const titleToPath = new Map<string, string>();

  for (const doc of docs) {
    pathToDoc.set(doc.path, doc);
    titleToPath.set(doc.title.toLowerCase(), doc.path);
  }

  const nodes: VaultNode[] = docs.map((doc) => ({
    id: doc.path,
    path: doc.path,
    title: doc.title,
    section: doc.section,
    linkCount: doc.wikilinks.length,
    tags: doc.tags,
  }));

  const edges: VaultEdge[] = [];

  for (const doc of docs) {
    for (const link of doc.wikilinks) {
      // Resolve wikilink to path
      const targetPath =
        titleToPath.get(link.toLowerCase()) ||
        titleToPath.get(link.split("|")[0].toLowerCase().trim());

      if (targetPath && targetPath !== doc.path) {
        edges.push({
          source: doc.path,
          target: targetPath,
          label: link,
        });
      }
    }
  }

  return { nodes, edges };
}
