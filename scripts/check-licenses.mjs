import { readFile } from "node:fs/promises";

const allowed = new Set(["Apache-2.0", "BSD-3-Clause", "ISC", "MIT", "OFL-1.1"]);
const lockfile = JSON.parse(await readFile("package-lock.json", "utf8"));
const violations = [];

for (const [packagePath, packageInfo] of Object.entries(lockfile.packages)) {
  if (!packagePath || packageInfo.dev === true) {
    continue;
  }

  if (!allowed.has(packageInfo.license)) {
    violations.push(`${packagePath}: ${packageInfo.license ?? "MISSING"}`);
  }
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("Production dependency licenses passed.");
}
