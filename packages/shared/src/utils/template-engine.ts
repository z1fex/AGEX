/**
 * Resolve {{placeholder}} patterns in template strings.
 */
export function resolveTemplate(
  template: string,
  values: Record<string, string>
): string {
  let resolved = template;
  for (const [key, value] of Object.entries(values)) {
    resolved = resolved.replace(
      new RegExp(`\\{\\{${key}\\}\\}`, "g"),
      value
    );
  }
  return resolved;
}

/**
 * Extract all {{placeholder}} names from a template.
 */
export function extractPlaceholders(template: string): string[] {
  const matches = template.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(2, -2).trim()))];
}

/**
 * Check if a template has unresolved placeholders.
 */
export function hasUnresolvedPlaceholders(text: string): boolean {
  return /\{\{[^}]+\}\}/.test(text);
}
