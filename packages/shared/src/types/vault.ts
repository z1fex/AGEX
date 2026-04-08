export interface VaultDocument {
  path: string;
  title: string;
  section: string;
  frontmatter: Record<string, unknown>;
  content: string;
  wikilinks: string[];
  tags: string[];
  wordCount: number;
  modifiedAt: number;
}

export interface VaultNode {
  id: string;
  path: string;
  title: string;
  section: string;
  linkCount: number;
  tags: string[];
}

export interface VaultEdge {
  source: string;
  target: string;
  label: string;
}

export interface VaultGraph {
  nodes: VaultNode[];
  edges: VaultEdge[];
}

export interface VaultFileEntry {
  name: string;
  type: "file" | "directory";
  path: string;
  children?: VaultFileEntry[];
}
