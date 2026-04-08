import fs from "node:fs";
import path from "node:path";
import type { ParsedAgent, AgentInstruction } from "@agency/shared";
import {
  extractTitle,
  extractBlockquoteMeta,
  splitByHeadings,
  extractCodeBlock,
  parseNumberedSteps,
  extractPathReferences,
  extractVariables,
} from "@agency/shared";

/**
 * Parse a v2 agent .md file into a structured ParsedAgent.
 *
 * Expected format:
 * # [Agent Name]
 * > **Team:** X | **Sub-team:** Y
 * ## Identity
 * ## When to Use
 * ## Instructions
 * ## Output Format
 * ## Save To
 */
export function parseAgentFile(filePath: string, contentRoot: string): ParsedAgent {
  const fullPath = path.resolve(contentRoot, filePath);
  const rawMarkdown = fs.readFileSync(fullPath, "utf-8");

  const name = extractTitle(rawMarkdown);
  const meta = extractBlockquoteMeta(rawMarkdown);
  const sections = splitByHeadings(rawMarkdown, 2);

  const sectionMap = new Map<string, string>();
  for (const section of sections) {
    sectionMap.set(section.heading.toLowerCase(), section.content);
  }

  // Parse instructions into structured steps
  const instructionsRaw = sectionMap.get("instructions") || "";
  const numberedSteps = parseNumberedSteps(instructionsRaw);
  const instructions: AgentInstruction[] = numberedSteps.map((step) => ({
    index: step.index,
    text: step.text,
    subSteps: step.subSteps,
    vaultPaths: extractPathReferences(
      step.text + " " + step.subSteps.join(" ")
    ),
  }));

  // Parse Save To section
  const saveToRaw = sectionMap.get("save to") || "";
  const vaultSavePath =
    saveToRaw.match(/vault[:/]\s*`?([^\s`]+)/i)?.[1] || "";
  const outputSavePath =
    saveToRaw.match(/output[:/]\s*`?([^\s`]+)/i)?.[1] || "";

  // Collect all path references across the file
  const allPaths = extractPathReferences(rawMarkdown);
  const allVars = extractVariables(rawMarkdown);

  // Extract output format (code block in Output Format section)
  const outputFormatRaw = sectionMap.get("output format") || "";
  const outputFormat = extractCodeBlock(outputFormatRaw) || outputFormatRaw;

  const slug = path.basename(filePath, ".md");

  return {
    slug,
    name,
    team: meta.team || "",
    subTeam: meta["sub-team"] || null,
    identity: sectionMap.get("identity") || "",
    whenToUse: sectionMap.get("when to use") || "",
    instructions,
    outputFormat,
    saveLocations: {
      vault: vaultSavePath,
      output: outputSavePath,
    },
    dependencies: allPaths.filter(
      (p) => p.startsWith("vault/") || p.startsWith("agents/")
    ),
    variables: allVars,
    filePath,
    rawMarkdown,
  };
}

/**
 * Parse all agent files from the content directory.
 */
export function parseAllAgents(contentRoot: string): ParsedAgent[] {
  const agentsDir = path.join(contentRoot, "agents");
  const agents: ParsedAgent[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith("_")) {
        walk(fullPath);
      } else if (
        entry.name.endsWith(".md") &&
        !entry.name.startsWith("_")
      ) {
        try {
          const relativePath = path.relative(contentRoot, fullPath).replace(/\\/g, "/");
          agents.push(parseAgentFile(relativePath, contentRoot));
        } catch (err) {
          console.warn(`Failed to parse agent: ${fullPath}`, err);
        }
      }
    }
  }

  walk(agentsDir);
  return agents;
}
