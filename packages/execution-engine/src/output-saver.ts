import fs from "node:fs";
import path from "node:path";

/**
 * Save an agent's output to vault and output directories.
 * Creates directories if they don't exist. Adds YAML frontmatter.
 */
export function saveOutput(
  content: string,
  options: {
    agentSlug: string;
    teamSlug: string;
    clientSlug?: string;
    vaultRoot: string;
    outputRoot: string;
  }
): { vaultPath: string; outputPath: string } {
  const { agentSlug, teamSlug, clientSlug, vaultRoot, outputRoot } = options;
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const client = clientSlug || "general";

  // Determine vault section based on team
  const vaultSection = getVaultSection(teamSlug);
  const fileName = `${date}-${agentSlug}.md`;

  // Build paths
  const vaultDir = path.join(vaultRoot, vaultSection, client);
  const outputDir = path.join(outputRoot, client, date);
  const vaultFilePath = path.join(vaultDir, fileName);
  const outputFilePath = path.join(outputDir, fileName);

  // Build frontmatter
  const frontmatter = [
    "---",
    `agent: ${agentSlug}`,
    `team: ${teamSlug}`,
    `client: ${client}`,
    `date: ${date}`,
    `created: ${new Date().toISOString()}`,
    "---",
    "",
  ].join("\n");

  const fullContent = frontmatter + content;

  // Write to vault
  fs.mkdirSync(vaultDir, { recursive: true });
  fs.writeFileSync(vaultFilePath, fullContent, "utf-8");

  // Write to output
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFilePath, fullContent, "utf-8");

  // Return relative paths
  return {
    vaultPath: path.relative(vaultRoot, vaultFilePath).replace(/\\/g, "/"),
    outputPath: path.relative(outputRoot, outputFilePath).replace(/\\/g, "/"),
  };
}

/**
 * Map team slug to vault section folder.
 */
function getVaultSection(teamSlug: string): string {
  const map: Record<string, string> = {
    marketing: "02-Campaigns",
    sales: "07-Sales",
    intelligence: "04-Intelligence",
    research: "03-Research",
    strategy: "06-Strategy",
    content: "05-Content",
    direction: "08-Operations",
    managing: "08-Operations",
  };
  return map[teamSlug] || "05-Content";
}

/**
 * List all saved outputs from the output directory.
 */
export function listOutputs(outputRoot: string): OutputEntry[] {
  const entries: OutputEntry[] = [];

  if (!fs.existsSync(outputRoot)) return entries;

  // Walk output/[client]/[date]/[file].md
  for (const clientDir of readDirSafe(outputRoot)) {
    const clientPath = path.join(outputRoot, clientDir);
    if (!fs.statSync(clientPath).isDirectory()) continue;

    for (const dateDir of readDirSafe(clientPath)) {
      const datePath = path.join(clientPath, dateDir);
      if (!fs.statSync(datePath).isDirectory()) continue;

      for (const file of readDirSafe(datePath)) {
        if (!file.endsWith(".md")) continue;

        const filePath = path.join(datePath, file);
        const content = fs.readFileSync(filePath, "utf-8");

        // Parse frontmatter
        const fm = parseFrontmatter(content);
        const title = content.match(/^#\s+(.+)$/m)?.[1] || file.replace(".md", "");

        entries.push({
          id: `${clientDir}/${dateDir}/${file}`,
          title,
          agent: fm.agent || file.replace(/^\d{4}-\d{2}-\d{2}-/, "").replace(".md", ""),
          team: fm.team || "unknown",
          client: clientDir,
          date: dateDir,
          path: path.relative(outputRoot, filePath).replace(/\\/g, "/"),
          wordCount: content.split(/\s+/).filter(Boolean).length,
        });
      }
    }
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

export interface OutputEntry {
  id: string;
  title: string;
  agent: string;
  team: string;
  client: string;
  date: string;
  path: string;
  wordCount: number;
}

function readDirSafe(dir: string): string[] {
  try {
    return fs.readdirSync(dir).filter((f) => !f.startsWith("."));
  } catch {
    return [];
  }
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) fm[key.trim()] = rest.join(":").trim();
  }
  return fm;
}
