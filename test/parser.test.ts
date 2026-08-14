import { writeFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";
import { resolveCareerOpsPaths } from "../src/server/config.js";
import { parseApplicationsMD } from "../src/server/parser.js";
import { createCareerOpsFixture } from "./helpers/career-ops-fixture.js";

describe("career-ops parser adapter", () => {
  test("reports the resolved path when the applications file is missing", async () => {
    const fixture = await createCareerOpsFixture();
    try {
      const paths = resolveCareerOpsPaths("missing", fixture.root);

      await expect(parseApplicationsMD(paths)).rejects.toThrow(
        `Applications file not found at ${paths.applicationsFile}`,
      );
    } finally {
      await fixture.cleanup();
    }
  });

  test("normalizes applications from the synthetic upstream fixture", async () => {
    const fixture = await createCareerOpsFixture();
    try {
      expect(await parseApplicationsMD(resolveCareerOpsPaths(fixture.root))).toEqual([
        expect.objectContaining({
          num: 1,
          company: "Acme Labs",
          via: "—",
          report: "001-acme-platform-engineer.md",
        }),
      ]);
    } finally {
      await fixture.cleanup();
    }
  });

  test("rejects a parser without the required upstream functions", async () => {
    const fixture = await createCareerOpsFixture();
    try {
      const paths = resolveCareerOpsPaths(fixture.root);
      await writeFile(paths.parserFile, "export const unsupported = true;\n", "utf8");

      await expect(parseApplicationsMD(paths)).rejects.toThrow(
        "missing resolveColumns or parseTrackerRow",
      );
    } finally {
      await fixture.cleanup();
    }
  });
});
