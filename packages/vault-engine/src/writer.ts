import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { validatePath } from "@agency/shared/utils";

/**
 * Write a markdown file to the vault with frontmatter.
 */
export function writeVaultFile(
  filePath: string,
  vaultRoot: string,
  content: string,
  frontmatter?: Record<string, unknown>
): void {
  const safePath = validatePath(filePath, vaultRoot);

  // Ensure parent directory exists
  const dir = path.dirname(safePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Check not a symlink
  try {
    const stat = fs.lstatSync(safePath);
    if (stat.isSymbolicLink()) {
      throw new Error("Cannot write to symbolic link");
    }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }

  const output = frontmatter
    ? matter.stringify(content, frontmatter)
    : content;

  fs.writeFileSync(safePath, output, { encoding: "utf-8", mode: 0o644 });
}

/**
 * Delete a vault file safely.
 */
export function deleteVaultFile(
  filePath: string,
  vaultRoot: string
): void {
  const safePath = validatePath(filePath, vaultRoot);

  const stat = fs.lstatSync(safePath);
  if (stat.isSymbolicLink()) {
    throw new Error("Cannot delete symbolic link");
  }

  fs.unlinkSync(safePath);
}

/**
 * Create a directory in the vault.
 */
export function createVaultDirectory(
  dirPath: string,
  vaultRoot: string
): void {
  const safePath = validatePath(dirPath, vaultRoot);
  fs.mkdirSync(safePath, { recursive: true });
}
