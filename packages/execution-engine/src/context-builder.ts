import fs from "node:fs";
import path from "node:path";

export interface ClientContext {
  slug: string;
  name: string;
  summary: string; // compact context for agent prompts (~2K tokens max)
}

/**
 * Read client files from vault and build a compact context string
 * that gets injected into every agent's system prompt.
 */
export function buildClientContext(
  clientSlug: string,
  vaultRoot: string
): ClientContext | null {
  const clientDir = path.join(vaultRoot, "01-Clients", clientSlug);

  if (!fs.existsSync(clientDir)) return null;

  const files: Record<string, string> = {};
  const fileNames = ["profile.md", "brand-voice.md", "icp.md", "goals.md", "competitors.md"];

  for (const f of fileNames) {
    const filePath = path.join(clientDir, f);
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      // Strip YAML frontmatter
      const stripped = content.replace(/^---[\s\S]*?---\n?/, "").trim();
      files[f.replace(".md", "")] = stripped;
    } catch {}
  }

  if (Object.keys(files).length === 0) return null;

  // Build compact summary (~2K tokens max)
  const parts: string[] = [];

  if (files.profile) {
    parts.push(`## Client Profile\n${truncate(files.profile, 500)}`);
  }
  if (files["brand-voice"]) {
    parts.push(`## Brand Voice\n${truncate(files["brand-voice"], 400)}`);
  }
  if (files.icp) {
    parts.push(`## Ideal Customer Profile\n${truncate(files.icp, 400)}`);
  }
  if (files.goals) {
    parts.push(`## Goals\n${truncate(files.goals, 300)}`);
  }
  if (files.competitors) {
    parts.push(`## Competitors\n${truncate(files.competitors, 300)}`);
  }

  const name = files.profile?.match(/^#\s+(.+)/m)?.[1] || clientSlug;

  return {
    slug: clientSlug,
    name,
    summary: parts.join("\n\n"),
  };
}

/**
 * Create the 5 client vault files from onboarding data.
 */
export function createClientFiles(
  clientSlug: string,
  vaultRoot: string,
  data: {
    profile: string;
    brandVoice: string;
    icp: string;
    goals: string;
    competitors: string;
  }
): void {
  const clientDir = path.join(vaultRoot, "01-Clients", clientSlug);
  fs.mkdirSync(clientDir, { recursive: true });

  const date = new Date().toISOString().split("T")[0];
  const frontmatter = (type: string) =>
    `---\nclient: ${clientSlug}\ntype: ${type}\ndate: ${date}\n---\n\n`;

  fs.writeFileSync(
    path.join(clientDir, "profile.md"),
    frontmatter("profile") + data.profile,
    "utf-8"
  );
  fs.writeFileSync(
    path.join(clientDir, "brand-voice.md"),
    frontmatter("brand-voice") + data.brandVoice,
    "utf-8"
  );
  fs.writeFileSync(
    path.join(clientDir, "icp.md"),
    frontmatter("icp") + data.icp,
    "utf-8"
  );
  fs.writeFileSync(
    path.join(clientDir, "goals.md"),
    frontmatter("goals") + data.goals,
    "utf-8"
  );
  fs.writeFileSync(
    path.join(clientDir, "competitors.md"),
    frontmatter("competitors") + data.competitors,
    "utf-8"
  );
}

/**
 * List all clients from the vault directory.
 */
export function listClients(
  vaultRoot: string
): { slug: string; name: string; onboardedAt: string }[] {
  const clientsDir = path.join(vaultRoot, "01-Clients");
  if (!fs.existsSync(clientsDir)) return [];

  return fs
    .readdirSync(clientsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
    .map((e) => {
      const profilePath = path.join(clientsDir, e.name, "profile.md");
      let name = e.name;
      let onboardedAt = "";

      try {
        const content = fs.readFileSync(profilePath, "utf-8");
        name = content.match(/^#\s+(.+)/m)?.[1] || e.name;
        onboardedAt = content.match(/date:\s*(.+)/)?.[1] || "";
      } catch {}

      return { slug: e.name, name, onboardedAt };
    });
}

function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "...";
}
