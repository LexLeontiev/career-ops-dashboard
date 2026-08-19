import { chmod, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, test } from "vitest";
import { spawnSync } from "node:child_process";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const startScript = path.join(projectRoot, "bin", "start.sh");
const temporaryDirectories: string[] = [];

async function makeTemporaryDirectory(prefix: string): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), prefix));
  temporaryDirectories.push(directory);
  return directory;
}

async function createCareerOpsFixture(root: string): Promise<void> {
  await mkdir(path.join(root, "data"), { recursive: true });
  await mkdir(path.join(root, "reports"), { recursive: true });
  await writeFile(path.join(root, "data", "applications.md"), "# Applications\n", "utf8");
  await writeFile(path.join(root, "tracker-parse.mjs"), "export default {};\n", "utf8");
}

async function createSyntheticDashboard(): Promise<{
  dashboardRoot: string;
  upstreamRoot: string;
  unrelatedCwd: string;
}> {
  const sandbox = await makeTemporaryDirectory("career-ops-start-");
  const dashboardRoot = path.join(sandbox, "career-ops-dashboard");
  const upstreamRoot = path.join(sandbox, "career-ops");
  const unrelatedCwd = path.join(sandbox, "caller", "deep", "elsewhere");
  await mkdir(path.join(dashboardRoot, "bin"), { recursive: true });
  await mkdir(unrelatedCwd, { recursive: true });
  await copyFile(startScript, path.join(dashboardRoot, "bin", "start.sh"));
  await createCareerOpsFixture(upstreamRoot);
  return { dashboardRoot, upstreamRoot, unrelatedCwd };
}

async function createFakeRuntime(
  root: string,
  nodeVersion: string,
  npmBody = 'printf "11.0.0\\n"',
): Promise<string> {
  const binDirectory = path.join(root, "fake-bin");
  await mkdir(binDirectory);
  const nodePath = path.join(binDirectory, "node");
  const npmPath = path.join(binDirectory, "npm");
  const [nodeMajor, nodeMinor] = nodeVersion.split(".");
  await writeFile(
    nodePath,
    `#!/usr/bin/env bash\nif [[ "\${1:-}" == "-p" ]]; then printf "${nodeMajor} ${nodeMinor}\\n"; else printf "v${nodeVersion}\\n"; fi\n`,
    "utf8",
  );
  await writeFile(npmPath, `#!/usr/bin/env bash\n${npmBody}\n`, "utf8");
  await chmod(nodePath, 0o755);
  await chmod(npmPath, 0o755);
  return binDirectory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, {
        recursive: true,
        force: true,
      }),
    ),
  );
});

describe("bin/start.sh", () => {
  test("passes check-only mode for a complete configured career-ops tree", async () => {
    const fixtureRoot = await makeTemporaryDirectory("career-ops-fixture-");
    await createCareerOpsFixture(fixtureRoot);

    const result = spawnSync("bash", ["bin/start.sh", "--check"], {
      cwd: projectRoot,
      env: { ...process.env, CAREER_OPS_ROOT: fixtureRoot },
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Environment check passed");
  });

  test("reports canonical clone guidance when the configured tree is missing", async () => {
    const sandbox = await makeTemporaryDirectory("career-ops-missing-");
    const missingRoot = path.join(sandbox, "missing");

    const result = spawnSync("bash", ["bin/start.sh", "--check"], {
      cwd: projectRoot,
      env: { ...process.env, CAREER_OPS_ROOT: missingRoot },
      encoding: "utf8",
    });

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}\n${result.stderr}`).toContain(
      "git clone https://github.com/santifer/career-ops.git",
    );
  });

  test("allows an upstream tree whose tracker has not been initialized", async () => {
    const fixtureRoot = await makeTemporaryDirectory("career-ops-incomplete-");
    await createCareerOpsFixture(fixtureRoot);
    await rm(path.join(fixtureRoot, "data/applications.md"));

    const result = spawnSync("bash", ["bin/start.sh", "--check"], {
      cwd: projectRoot,
      env: { ...process.env, CAREER_OPS_ROOT: fixtureRoot },
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Tracker not initialized yet");
    expect(result.stdout).toContain("Environment check passed");
  });

  test.each(["reports", "tracker-parse.mjs"])(
    "rejects an upstream tree missing %s",
    async (missingPath) => {
      const fixtureRoot = await makeTemporaryDirectory("career-ops-incomplete-");
      await createCareerOpsFixture(fixtureRoot);
      await rm(path.join(fixtureRoot, missingPath), { recursive: true });

      const result = spawnSync("bash", ["bin/start.sh", "--check"], {
        cwd: projectRoot,
        env: { ...process.env, CAREER_OPS_ROOT: fixtureRoot },
        encoding: "utf8",
      });

      expect(result.status).not.toBe(0);
      expect(`${result.stdout}\n${result.stderr}`).toContain(missingPath);
    },
  );

  test("locates dashboard files independently of the caller working directory", async () => {
    const fixtureRoot = await makeTemporaryDirectory("career-ops-fixture-");
    const unrelatedCwd = await makeTemporaryDirectory("career-ops-cwd-");
    await createCareerOpsFixture(fixtureRoot);

    const result = spawnSync("bash", [startScript, "--check"], {
      cwd: unrelatedCwd,
      env: { ...process.env, CAREER_OPS_ROOT: fixtureRoot },
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Environment check passed");
  });

  test("resolves the default career-ops tree beside the script project", async () => {
    const fixture = await createSyntheticDashboard();
    const syntheticStartScript = path.join(fixture.dashboardRoot, "bin", "start.sh");
    const env = { ...process.env };
    delete env.CAREER_OPS_ROOT;

    const result = spawnSync("bash", [syntheticStartScript, "--check"], {
      cwd: fixture.unrelatedCwd,
      env,
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Environment check passed");
  });

  test.each([{ args: ["--unknown"] }, { args: ["--check", "extra"] }])(
    "rejects unsupported arguments with usage and exit status 2: $args",
    ({ args }) => {
      const result = spawnSync("bash", ["bin/start.sh", ...args], {
        cwd: projectRoot,
        env: { ...process.env },
        encoding: "utf8",
      });

      expect(result.status).toBe(2);
      expect(`${result.stdout}\n${result.stderr}`).toContain("Usage:");
    },
  );

  test("rejects Node versions below 22.13", async () => {
    const fixture = await createSyntheticDashboard();
    const fakeBin = await createFakeRuntime(fixture.dashboardRoot, "22.12.9");

    const result = spawnSync(
      "bash",
      [path.join(fixture.dashboardRoot, "bin", "start.sh"), "--check"],
      {
        cwd: fixture.unrelatedCwd,
        env: { ...process.env, PATH: `${fakeBin}:${process.env.PATH ?? ""}` },
        encoding: "utf8",
      },
    );

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}\n${result.stderr}`).toContain("Node.js >= 22.13 required");
  });

  test("accepts Node 22.13 in check-only mode", async () => {
    const fixture = await createSyntheticDashboard();
    const fakeBin = await createFakeRuntime(fixture.dashboardRoot, "22.13.0");

    const result = spawnSync(
      "bash",
      [path.join(fixture.dashboardRoot, "bin", "start.sh"), "--check"],
      {
        cwd: fixture.unrelatedCwd,
        env: { ...process.env, PATH: `${fakeBin}:${process.env.PATH ?? ""}` },
        encoding: "utf8",
      },
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Environment check passed");
  });

  test("uses npm ci and forwards CAREER_OPS_ROOT unchanged when starting", async () => {
    const fixture = await createSyntheticDashboard();
    const npmLog = path.join(fixture.dashboardRoot, "npm.log");
    const fakeBin = await createFakeRuntime(
      fixture.dashboardRoot,
      "22.13.0",
      'printf "%s|%s\\n" "$*" "${CAREER_OPS_ROOT:-}" >> "$NPM_LOG"',
    );

    const result = spawnSync("bash", [path.join(fixture.dashboardRoot, "bin", "start.sh")], {
      cwd: fixture.unrelatedCwd,
      env: {
        ...process.env,
        CAREER_OPS_ROOT: "../career-ops",
        NPM_LOG: npmLog,
        PATH: `${fakeBin}:${process.env.PATH ?? ""}`,
      },
      encoding: "utf8",
    });

    expect(result.status).toBe(0);
    const npmCalls = await readFile(npmLog, "utf8");
    expect(npmCalls).toContain("ci --no-audit --no-fund|");
    expect(npmCalls).toContain("run dev|../career-ops");
  });
});
