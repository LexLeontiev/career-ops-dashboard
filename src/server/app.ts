import express, { type Express } from "express";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCareerOpsPaths, type CareerOpsPaths } from "./config.js";
import { parseApplicationsMD } from "./parser.js";

export interface CreateAppOptions {
  paths?: CareerOpsPaths;
  logger?: Pick<Console, "error">;
  staticDirectory?: string | false;
}

const reportFilenamePattern = /^[A-Za-z0-9][A-Za-z0-9_-]*\.md$/;

function isErrorWithCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

export function resolveReportPath(reportsDirectory: string, filename: string): string {
  if (!reportFilenamePattern.test(filename)) {
    throw new Error("Invalid report filename format");
  }

  const resolvedReportsDirectory = path.resolve(reportsDirectory);
  const filePath = path.resolve(resolvedReportsDirectory, filename);
  if (path.dirname(filePath) !== resolvedReportsDirectory) {
    throw new Error("Invalid report filename format");
  }

  return filePath;
}

export function createApp(options: CreateAppOptions = {}): Express {
  const app = express();
  const paths = options.paths ?? getCareerOpsPaths();
  const logger = options.logger ?? console;

  app.use((_request, response, next) => {
    response.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Cross-Origin-Resource-Policy": "same-origin",
    });
    next();
  });

  app.get("/api/applications", async (_request, response) => {
    try {
      response.json(await parseApplicationsMD(paths));
    } catch (error: unknown) {
      logger.error(error);
      response.status(500).json({
        error: "Unable to load applications. Check CAREER_OPS_ROOT and server logs.",
      });
    }
  });

  app.get("/api/reports/:filename", async (request, response) => {
    let filePath: string;
    try {
      filePath = resolveReportPath(paths.reportsDirectory, request.params.filename);
    } catch {
      response.status(400).json({ error: "Invalid report filename format" });
      return;
    }

    try {
      const content = await readFile(filePath, "utf8");
      response.type("text/markdown").send(content);
    } catch (error: unknown) {
      if (isErrorWithCode(error, "ENOENT")) {
        response.status(404).json({ error: `Report ${request.params.filename} not found` });
        return;
      }
      logger.error(error);
      response.status(500).json({ error: "Failed to read report content" });
    }
  });

  if (typeof options.staticDirectory === "string") {
    const staticDirectory = path.resolve(options.staticDirectory);
    app.use(express.static(staticDirectory));
    app.get("*", (_request, response) => {
      response.sendFile(path.join(staticDirectory, "index.html"));
    });
  }

  return app;
}
