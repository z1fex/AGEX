/**
 * Core markdown section parser for v2 agent/workflow files.
 * Splits markdown by H2 (##) headers into named sections.
 */

export interface MarkdownSection {
  heading: string;
  level: number;
  content: string;
}

/**
 * Split markdown into sections by heading level.
 * Returns an array of { heading, level, content } objects.
 */
export function splitByHeadings(
  markdown: string,
  level: 2 | 3 = 2
): MarkdownSection[] {
  const prefix = "#".repeat(level);
  const regex = new RegExp(`^${prefix}\\s+(.+)$`, "gm");
  const sections: MarkdownSection[] = [];
  const lines = markdown.split("\n");

  let currentHeading = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    const match = line.match(new RegExp(`^${prefix}\\s+(.+)$`));
    if (match) {
      if (currentHeading || currentLines.length > 0) {
        sections.push({
          heading: currentHeading,
          level,
          content: currentLines.join("\n").trim(),
        });
      }
      currentHeading = match[1].trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  // Push the last section
  if (currentHeading || currentLines.length > 0) {
    sections.push({
      heading: currentHeading,
      level,
      content: currentLines.join("\n").trim(),
    });
  }

  return sections;
}

/**
 * Extract the H1 title from markdown.
 */
export function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

/**
 * Extract the blockquote metadata line after H1.
 * Format: > **Team:** X | **Sub-team:** Y
 */
export function extractBlockquoteMeta(
  markdown: string
): Record<string, string> {
  const match = markdown.match(/^>\s*(.+)$/m);
  if (!match) return {};

  const meta: Record<string, string> = {};
  const parts = match[1].split("|").map((p) => p.trim());

  for (const part of parts) {
    const kv = part.match(/\*\*(.+?):\*\*\s*(.+)/);
    if (kv) {
      meta[kv[1].toLowerCase().trim()] = kv[2].trim();
    }
  }

  return meta;
}

/**
 * Extract content from a fenced code block within a section.
 */
export function extractCodeBlock(content: string): string {
  const match = content.match(/```[\w]*\n([\s\S]*?)```/);
  return match ? match[1].trim() : "";
}

/**
 * Parse numbered instruction steps from a section.
 * Handles: 1. Step text\n   - Sub-step\n   a. Sub-step
 */
export function parseNumberedSteps(
  content: string
): { index: number; text: string; subSteps: string[] }[] {
  const steps: { index: number; text: string; subSteps: string[] }[] = [];
  const lines = content.split("\n");

  let currentStep: { index: number; text: string; subSteps: string[] } | null =
    null;

  for (const line of lines) {
    const stepMatch = line.match(/^\d+\.\s+(.+)$/);
    if (stepMatch) {
      if (currentStep) steps.push(currentStep);
      currentStep = {
        index: steps.length + 1,
        text: stepMatch[1].trim(),
        subSteps: [],
      };
    } else if (currentStep) {
      const subMatch = line.match(/^\s+[-•a-z]\.\s*(.+)$|^\s+-\s+(.+)$/);
      if (subMatch) {
        currentStep.subSteps.push((subMatch[1] || subMatch[2]).trim());
      }
    }
  }

  if (currentStep) steps.push(currentStep);
  return steps;
}

/**
 * Extract all vault/output path references from text.
 * Matches: vault/..., output/..., agents/...
 */
export function extractPathReferences(text: string): string[] {
  const matches = text.match(
    /(?:vault|output|agents|workflows|templates)\/[^\s,)}`'"]+/g
  );
  return matches ? [...new Set(matches)] : [];
}

/**
 * Extract [variable] patterns from path strings.
 * E.g., "vault/01-Clients/[client]/blog.md" → ["client"]
 */
export function extractVariables(text: string): string[] {
  const matches = text.match(/\[([^\]]+)\]/g);
  if (!matches) return [];
  return [
    ...new Set(matches.map((m) => m.slice(1, -1)).filter((v) => v !== "x")),
  ];
}

/**
 * Extract [[wikilinks]] from markdown content.
 */
export function extractWikilinks(content: string): string[] {
  const matches = content.match(/\[\[([^\]]+)\]\]/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(2, -2));
}

/**
 * Parse a markdown table into an array of row objects.
 */
export function parseMarkdownTable(
  content: string
): Record<string, string>[] {
  const lines = content
    .split("\n")
    .filter((l) => l.trim().startsWith("|") && !l.trim().match(/^\|[\s-|]+\|$/));

  if (lines.length < 1) return [];

  const headers = lines[0]
    .split("|")
    .map((h) => h.trim())
    .filter(Boolean);

  return lines.slice(1).map((line) => {
    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);

    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h.toLowerCase().replace(/[^a-z0-9]/g, "_")] = cells[i] || "";
    });
    return row;
  });
}
