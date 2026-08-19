import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import type { Application } from "../shared/application.js";
import { getCareerOpsPaths, type CareerOpsPaths } from "./config.js";

interface TrackerParser {
  resolveColumns(lines: string[]): unknown;
  parseTrackerRow(line: string, colmap: unknown): unknown;
}

export class ApplicationsFileNotFoundError extends Error {
  override readonly name = "ApplicationsFileNotFoundError";

  constructor(filePath: string, options?: ErrorOptions) {
    super(`Applications file not found at ${filePath}`, options);
  }
}

function isTrackerParser(value: unknown): value is TrackerParser {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.resolveColumns === "function" &&
    typeof candidate.parseTrackerRow === "function"
  );
}

function normalizeReport(value: unknown): string {
  const raw = String(value ?? "");
  const markdownLink = raw.match(/\[[^\]]*\]\(([^)]+)\)/);
  const link = markdownLink?.[1] ?? raw;
  return link.split(/[\\/]/).pop()?.trim() ?? "";
}

function normalizeApplication(value: unknown): Application | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.num !== "number" || !Number.isFinite(candidate.num)) return null;

  return {
    num: candidate.num,
    date: String(candidate.date ?? ""),
    company: String(candidate.company ?? ""),
    via: String(candidate.via ?? "") || "—",
    role: String(candidate.role ?? ""),
    score: String(candidate.score ?? ""),
    status: String(candidate.status ?? ""),
    pdf: String(candidate.pdf ?? ""),
    report: normalizeReport(candidate.report),
    notes: String(candidate.notes ?? ""),
  };
}

export async function parseApplicationsMD(
  paths: CareerOpsPaths = getCareerOpsPaths(),
): Promise<Application[]> {
  let markdown: string;
  try {
    markdown = await readFile(paths.applicationsFile, "utf8");
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      throw new ApplicationsFileNotFoundError(paths.applicationsFile, { cause: error });
    }
    throw error;
  }

  const trackerParser: unknown = await import(pathToFileURL(paths.parserFile).href);
  if (!isTrackerParser(trackerParser)) {
    throw new TypeError("Upstream parser missing resolveColumns or parseTrackerRow");
  }

  const lines = markdown.split("\n");
  const colmap = trackerParser.resolveColumns(lines);
  const applications: Application[] = [];

  for (const line of lines) {
    const application = normalizeApplication(trackerParser.parseTrackerRow(line, colmap));
    if (application) applications.push(application);
  }

  return applications.sort((left, right) => right.num - left.num);
}
