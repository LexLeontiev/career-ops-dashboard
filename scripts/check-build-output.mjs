import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const assetsDirectory = path.resolve("dist/client/assets");
const limits = new Map([
  [".js", 500_000],
  [".woff", 500_000],
  [".woff2", 500_000],
]);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

const oversizedAssets = [];
const files = (await collectFiles(assetsDirectory)).sort();

for (const file of files) {
  const extension = path.extname(file).toLowerCase();
  const limit = limits.get(extension);
  if (limit === undefined) continue;

  const { size } = await stat(file);
  if (size > limit) {
    oversizedAssets.push(`${path.relative(assetsDirectory, file)} (${size} bytes; limit ${limit})`);
  }
}

if (oversizedAssets.length > 0) {
  console.error("Build asset limits exceeded:");
  for (const asset of oversizedAssets) console.error(`- ${asset}`);
  process.exitCode = 1;
} else {
  console.log("Build asset limits passed.");
}
