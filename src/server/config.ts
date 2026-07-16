import path from "node:path";
import fs from "node:fs";

export function careerOpsRoot(): string {
  const env = process.env.CAREER_OPS_ROOT?.trim();
  if (env) return env;
  // If we are in project/src/server/ or similar, resolver must handle absolute paths safely relative to the workspace root.
  return path.resolve(process.cwd(), "../career-ops");
}

export function getApplicationsPath(): string {
  return path.join(careerOpsRoot(), "data", "applications.md");
}

export function getReportsDirectory(): string {
  return path.join(careerOpsRoot(), "reports");
}
