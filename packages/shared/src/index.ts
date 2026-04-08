// Client-safe exports (types + constants only — no Node.js modules)
export * from "./types/index";
export * from "./constants/index";

// NOTE: utils (markdown-parser, path-resolver, frontmatter, template-engine)
// use Node.js modules (fs, path) and must be imported separately:
// import { ... } from "@agency/shared/utils"
// Only use in server components or API routes.
