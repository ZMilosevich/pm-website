import { lstat, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const distRoot = path.resolve("dist");
const manifestPath = path.join(distRoot, ".pacematcher-managed-paths");

async function collectFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.posix.join(prefix, entry.name);
    const stats = await lstat(absolutePath);

    if (stats.isSymbolicLink()) {
      throw new Error(`Refusing to manifest symbolic link: ${relativePath}`);
    }

    if (stats.isDirectory()) {
      files.push(...(await collectFiles(absolutePath, relativePath)));
    } else if (stats.isFile()) {
      files.push(relativePath);
    }
  }

  return files;
}

await writeFile(manifestPath, "", "utf8");
const files = (await collectFiles(distRoot)).sort((left, right) => left.localeCompare(right));
await writeFile(manifestPath, `${files.join("\n")}\n`, "utf8");
