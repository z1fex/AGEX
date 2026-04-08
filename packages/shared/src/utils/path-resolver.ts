import path from "node:path";

/**
 * Resolve [variable] patterns in vault/output paths.
 * E.g., "vault/01-Clients/[client]/blog-[date].md"
 *    → "vault/01-Clients/FreshBrew Coffee/blog-2026-04-08.md"
 */
export function resolvePath(
  pattern: string,
  variables: Record<string, string>
): string {
  let resolved = pattern;
  for (const [key, value] of Object.entries(variables)) {
    resolved = resolved.replace(new RegExp(`\\[${key}\\]`, "g"), value);
  }
  return resolved;
}

/**
 * Validate a path is within the allowed root directory.
 * Prevents path traversal attacks (../../.env).
 */
export function validatePath(userPath: string, allowedRoot: string): string {
  const resolved = path.resolve(allowedRoot, userPath);

  if (
    !resolved.startsWith(allowedRoot + path.sep) &&
    resolved !== allowedRoot
  ) {
    throw new PathTraversalError(
      `Access denied: path escapes allowed directory`
    );
  }

  return resolved;
}

export class PathTraversalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PathTraversalError";
  }
}

/**
 * Convert a client name to a URL-safe slug.
 * "FreshBrew Coffee" → "freshbrew-coffee"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Get today's date in YYYY-MM-DD format.
 */
export function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}
