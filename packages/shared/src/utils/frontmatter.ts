import matter from "gray-matter";

export interface ParsedFrontmatter<T = Record<string, unknown>> {
  data: T;
  content: string;
}

export function parseFrontmatter<T = Record<string, unknown>>(
  markdown: string
): ParsedFrontmatter<T> {
  const { data, content } = matter(markdown, {
    engines: {
      yaml: (str: string) => {
        // Use JSON_SCHEMA to prevent code execution via !!js/function
        const yaml = require("gray-matter/lib/engines").yaml;
        return yaml.parse(str);
      },
    },
  });
  return { data: data as T, content: content.trim() };
}

export function serializeFrontmatter(
  data: Record<string, unknown>,
  content: string
): string {
  return matter.stringify(content, data);
}
