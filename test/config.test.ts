import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { getCareerOpsPaths, resolveCareerOpsPaths } from "../src/server/config.js";

describe("career-ops path resolution", () => {
  const directories: string[] = [];
  afterEach(async () => {
    await Promise.all(
      directories.splice(0).map((dir) => rm(dir, { recursive: true, force: true })),
    );
  });

  async function splitFixture() {
    const directory = realpathSync(await mkdtemp(path.join(tmpdir(), "dashboard-paths-")));
    directories.push(directory);
    const code = path.join(directory, "career-ops");
    const data = path.join(directory, "personal data");
    const dashboard = path.join(directory, "dashboard");
    await mkdir(code);
    await mkdir(path.join(data, "data"), { recursive: true });
    await writeFile(path.join(code, "tracker-parse.mjs"), "export default {};\n");
    await writeFile(path.join(data, "data/applications.md"), "# Applications\n");
    return { code, data, dashboard };
  }

  test("resolves a relative marker from the physical checkout behind a symlink", async () => {
    const { code, data, dashboard } = await splitFixture();
    await mkdir(path.join(dashboard, "links"), { recursive: true });
    const linkedCode = path.join(dashboard, "links/career-ops");
    await symlink(code, linkedCode);
    await writeFile(path.join(code, ".career-ops-data"), "../personal data\n");
    const paths = getCareerOpsPaths({ CAREER_OPS_CODE_ROOT: linkedCode }, dashboard);
    expect(paths.applicationsFile).toBe(path.join(data, "data/applications.md"));
  });

  test.each(["absolute", "relative"])(
    "reads a %s data marker relative to the checkout",
    async (kind) => {
      const { code, data, dashboard } = await splitFixture();
      await writeFile(
        path.join(code, ".career-ops-data"),
        `  ${kind === "absolute" ? data : "../personal data"}\n`,
      );
      const paths = getCareerOpsPaths({}, dashboard);
      expect(paths.applicationsFile).toBe(path.join(data, "data/applications.md"));
      expect(paths.reportsDirectory).toBe(path.join(data, "reports"));
      expect(paths.parserFile).toBe(path.join(code, "tracker-parse.mjs"));
      expect(paths.followUpCadenceFile).toBe(path.join(code, "followup-cadence.mjs"));
    },
  );

  test("data environment overrides a marker while preserving a legacy checkout setting", async () => {
    const { code, data, dashboard } = await splitFixture();
    await writeFile(path.join(code, ".career-ops-data"), "../wrong-data\n");
    const paths = getCareerOpsPaths(
      { CAREER_OPS_ROOT: code, CAREER_OPS_DATA_DIR: "../personal data" },
      dashboard,
    );
    expect(paths.root).toBe(code);
    expect(paths.applicationsFile).toBe(path.join(data, "data/applications.md"));
  });

  test("supports upstream CAREER_OPS_ROOT as a data directory beside the default checkout", async () => {
    const { code, data, dashboard } = await splitFixture();
    const paths = getCareerOpsPaths({ CAREER_OPS_ROOT: data }, dashboard);
    expect(paths.root).toBe(code);
    expect(paths.applicationsFile).toBe(path.join(data, "data/applications.md"));
  });

  test("an explicit code root makes upstream ROOT take precedence over DATA_DIR", async () => {
    const { code, data, dashboard } = await splitFixture();
    const paths = getCareerOpsPaths(
      {
        CAREER_OPS_CODE_ROOT: code,
        CAREER_OPS_ROOT: "../personal data",
        CAREER_OPS_DATA_DIR: "../wrong-data",
      },
      dashboard,
    );
    expect(paths.root).toBe(code);
    expect(paths.applicationsFile).toBe(path.join(data, "data/applications.md"));
  });

  test("resolves a tracker override against the dashboard working directory", async () => {
    const { code, dashboard } = await splitFixture();
    const paths = getCareerOpsPaths(
      { CAREER_OPS_CODE_ROOT: code, CAREER_OPS_TRACKER: "../custom.md" },
      dashboard,
    );
    expect(paths.applicationsFile).toBe(path.resolve(dashboard, "../custom.md"));
  });

  test("supports the upstream root-level tracker fallback", async () => {
    const { code, data, dashboard } = await splitFixture();
    await rm(path.join(data, "data/applications.md"));
    await writeFile(path.join(data, "applications.md"), "# Applications\n");
    expect(
      getCareerOpsPaths({ CAREER_OPS_CODE_ROOT: code, CAREER_OPS_DATA_DIR: data }, dashboard)
        .applicationsFile,
    ).toBe(path.join(data, "applications.md"));
  });

  test("ignores a blank marker", async () => {
    const { code, dashboard } = await splitFixture();
    await writeFile(path.join(code, ".career-ops-data"), " \n");
    expect(getCareerOpsPaths({}, dashboard).applicationsFile).toBe(
      path.join(code, "data/applications.md"),
    );
  });
  test("resolves a relative root against the supplied working directory", () => {
    expect(resolveCareerOpsPaths("./relative-root", "/workspace/dashboard").root).toBe(
      "/workspace/dashboard/relative-root",
    );
  });

  test("prefers a configured career-ops root", () => {
    expect(getCareerOpsPaths({ CAREER_OPS_ROOT: "/tmp/custom" }, "/workspace/dashboard").root).toBe(
      "/tmp/custom",
    );
  });

  test("defaults to the adjacent career-ops directory", () => {
    expect(getCareerOpsPaths({}, "/workspace/dashboard").root).toBe("/workspace/career-ops");
  });
});
