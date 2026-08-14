import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createApp, resolveReportPath } from "../src/server/app.js";
import { resolveCareerOpsPaths } from "../src/server/config.js";
import { parsePort } from "../src/server/start.js";
import {
  createCareerOpsFixture,
  type CareerOpsFixture,
} from "./helpers/career-ops-fixture.js";
import { withHttpServer } from "./helpers/http-server.js";

const securityHeaders = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "cross-origin-resource-policy": "same-origin",
};

describe("HTTP application", () => {
  let fixture: CareerOpsFixture;

  beforeEach(async () => {
    fixture = await createCareerOpsFixture();
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  test("serves applications and reports from the injected career-ops paths", async () => {
    const paths = resolveCareerOpsPaths(fixture.root);
    const logger = { error: vi.fn() };

    await withHttpServer(createApp({ paths, logger }), async (baseUrl) => {
      const applicationsResponse = await fetch(`${baseUrl}/api/applications`);
      expect(applicationsResponse.status).toBe(200);
      expect(await applicationsResponse.json()).toEqual([
        expect.objectContaining({ company: "Acme Labs" }),
      ]);

      const reportResponse = await fetch(
        `${baseUrl}/api/reports/001-acme-platform-engineer.md`,
      );
      expect(reportResponse.status).toBe(200);
      expect(reportResponse.headers.get("content-type")).toContain("text/markdown");
      expect(await reportResponse.text()).toContain("Synthetic report");

      for (const response of [applicationsResponse, reportResponse]) {
        for (const [name, value] of Object.entries(securityHeaders)) {
          expect(response.headers.get(name)).toBe(value);
        }
      }
    });

    expect(logger.error).not.toHaveBeenCalled();
  });

  test("rejects invalid report paths and maps missing reports to 404", async () => {
    const paths = resolveCareerOpsPaths(fixture.root);

    expect(() => resolveReportPath(paths.reportsDirectory, "../.env")).toThrow(
      "Invalid report filename format",
    );

    await withHttpServer(createApp({ paths, logger: { error: vi.fn() } }), async (baseUrl) => {
      const missingResponse = await fetch(`${baseUrl}/api/reports/missing.md`);
      expect(missingResponse.status).toBe(404);

      const invalidResponse = await fetch(`${baseUrl}/api/reports/..%2F.env`);
      expect(invalidResponse.status).toBe(400);

      for (const response of [missingResponse, invalidResponse]) {
        for (const [name, value] of Object.entries(securityHeaders)) {
          expect(response.headers.get(name)).toBe(value);
        }
      }
    });
  });

  test("returns a stable generic error and logs the original applications failure", async () => {
    const paths = resolveCareerOpsPaths(fixture.root);
    const logger = { error: vi.fn() };
    await rm(paths.applicationsFile);

    await withHttpServer(createApp({ paths, logger }), async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/applications`);
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Unable to load applications. Check CAREER_OPS_ROOT and server logs.",
      });
      for (const [name, value] of Object.entries(securityHeaders)) {
        expect(response.headers.get(name)).toBe(value);
      }
    });

    expect(logger.error).toHaveBeenCalledOnce();
    expect(logger.error.mock.calls[0]?.[0]).toBeInstanceOf(Error);
  });

  test("serves an injected static directory with a GET SPA fallback", async () => {
    const paths = resolveCareerOpsPaths(fixture.root);
    const staticDirectory = path.join(fixture.root, "static");
    await mkdir(staticDirectory);
    await writeFile(path.join(staticDirectory, "index.html"), "<h1>Fixture SPA</h1>", "utf8");
    await writeFile(path.join(staticDirectory, "asset.txt"), "fixture asset", "utf8");

    await withHttpServer(
      createApp({ paths, staticDirectory, logger: { error: vi.fn() } }),
      async (baseUrl) => {
        const assetResponse = await fetch(`${baseUrl}/asset.txt`);
        expect(assetResponse.status).toBe(200);
        expect(await assetResponse.text()).toBe("fixture asset");

        const fallbackResponse = await fetch(`${baseUrl}/applications/1`);
        expect(fallbackResponse.status).toBe(200);
        expect(await fallbackResponse.text()).toContain("Fixture SPA");
      },
    );
  });

  test("does not add the SPA fallback when static serving is disabled", async () => {
    const paths = resolveCareerOpsPaths(fixture.root);

    await withHttpServer(
      createApp({ paths, staticDirectory: false, logger: { error: vi.fn() } }),
      async (baseUrl) => {
        expect((await fetch(`${baseUrl}/applications/1`)).status).toBe(404);
      },
    );
  });
});

describe("server startup", () => {
  test("uses the default port when PORT is unset", () => {
    expect(parsePort(undefined)).toBe(3001);
  });

  test("accepts an integer port in range", () => {
    expect(parsePort("4317")).toBe(4317);
  });

  test.each(["0", "abc"])("rejects invalid PORT value %s", (value) => {
    expect(() => parsePort(value)).toThrow("PORT must be an integer between 1 and 65535");
  });
});
