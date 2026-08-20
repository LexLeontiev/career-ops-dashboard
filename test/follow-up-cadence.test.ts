import { writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { loadFollowUpCadence } from "../src/server/follow-up-cadence.js";
import { resolveCareerOpsPaths } from "../src/server/config.js";
import { createCareerOpsFixture } from "./helpers/career-ops-fixture.js";

describe("follow-up cadence adapter", () => {
  test("runs the configured career-ops cadence script and normalizes its JSON output", async () => {
    const fixture = await createCareerOpsFixture();
    try {
      const paths = resolveCareerOpsPaths(fixture.root);
      await writeFile(
        path.join(fixture.root, "followup-cadence.mjs"),
        `process.stdout.write(JSON.stringify({ entries: [
          {
            num: 29,
            company: "Proton",
            notes: "Interview complete; feedback pending.",
            urgency: "overdue",
            nextFollowupDate: "2026-08-13"
          },
          {
            num: 52,
            company: "Yazio",
            notes: "No more reminders.",
            urgency: "cold",
            nextFollowupDate: null
          }
        ] }));\n`,
        "utf8",
      );

      await expect(loadFollowUpCadence(paths)).resolves.toEqual([
        {
          appNum: 29,
          date: "2026-08-13",
          company: "Proton",
          notes: "Interview complete; feedback pending.",
          urgency: "overdue",
        },
      ]);
    } finally {
      await fixture.cleanup();
    }
  });

  test("rejects output that is not valid cadence JSON", async () => {
    const fixture = await createCareerOpsFixture();
    try {
      const paths = resolveCareerOpsPaths(fixture.root);
      await writeFile(
        path.join(fixture.root, "followup-cadence.mjs"),
        'process.stdout.write("not json");\n',
        "utf8",
      );

      await expect(loadFollowUpCadence(paths)).rejects.toThrow();
    } finally {
      await fixture.cleanup();
    }
  });
});
