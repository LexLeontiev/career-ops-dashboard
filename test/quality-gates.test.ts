import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const temporaryDirectories: string[] = [];
const licenseScript = resolve("scripts/check-licenses.mjs");
const secretScript = resolve("scripts/check-secrets.sh");

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

function createTemporaryDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), "career-ops-quality-gates-"));
  temporaryDirectories.push(directory);
  return directory;
}

function run(command: string, args: string[], cwd: string) {
  return spawnSync(command, args, { cwd, encoding: "utf8" });
}

function initializeRepository(directory: string): void {
  execFileSync("git", ["init", "--quiet"], { cwd: directory });
  execFileSync("git", ["config", "user.email", "quality-gates@example.test"], { cwd: directory });
  execFileSync("git", ["config", "user.name", "Quality Gates"], { cwd: directory });
}

describe("local quality scripts", () => {
  test("accepts allowed production licenses and ignores development dependencies", () => {
    const directory = createTemporaryDirectory();
    writeFileSync(
      join(directory, "package-lock.json"),
      JSON.stringify({
        lockfileVersion: 3,
        packages: {
          "": { license: "UNLICENSED" },
          "node_modules/production-package": { license: "MIT" },
          "node_modules/development-package": { dev: true, license: "UNLICENSED" },
        },
      }),
    );

    const result = run("node", [licenseScript], directory);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Production dependency licenses passed.");
  });

  test("reports production dependencies with a disallowed or missing license", () => {
    const directory = createTemporaryDirectory();
    writeFileSync(
      join(directory, "package-lock.json"),
      JSON.stringify({
        lockfileVersion: 3,
        packages: {
          "": { license: "MIT" },
          "node_modules/disallowed-package": { license: "GPL-3.0" },
          "node_modules/missing-package": {},
        },
      }),
    );

    const result = run("node", [licenseScript], directory);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("node_modules/disallowed-package: GPL-3.0");
    expect(result.stderr).toContain("node_modules/missing-package: MISSING");
  });

  test("passes a clean tracked repository and its history", () => {
    const directory = createTemporaryDirectory();
    initializeRepository(directory);
    writeFileSync(join(directory, "README.md"), "clean release tree\n");
    execFileSync("git", ["add", "README.md"], { cwd: directory });
    execFileSync("git", ["commit", "--quiet", "-m", "initial"], { cwd: directory });

    const result = run("bash", [secretScript], directory);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Tracked files and history secret scan passed.");
  });

  test("rejects a private path in tracked history", () => {
    const directory = createTemporaryDirectory();
    initializeRepository(directory);
    const privatePath = ["/Use" + "rs", "release-owner", "private-key"].join("/");
    writeFileSync(join(directory, "credentials.txt"), `${privatePath}\n`);
    execFileSync("git", ["add", "credentials.txt"], { cwd: directory });
    execFileSync("git", ["commit", "--quiet", "-m", "bad history"], { cwd: directory });
    writeFileSync(join(directory, "credentials.txt"), "removed from tree\n");
    execFileSync("git", ["add", "credentials.txt"], { cwd: directory });
    execFileSync("git", ["commit", "--quiet", "-m", "remove path"], { cwd: directory });

    const result = run("bash", [secretScript], directory);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Potential secret or private path found in tracked history.");
  });
});
