import path from "node:path";

export interface CareerOpsPaths {
  root: string;
  applicationsFile: string;
  followUpCadenceFile: string;
  reportsDirectory: string;
  parserFile: string;
}

export function resolveCareerOpsPaths(root: string, cwd = process.cwd()): CareerOpsPaths {
  const resolvedRoot = path.resolve(cwd, root);
  return {
    root: resolvedRoot,
    applicationsFile: path.join(resolvedRoot, "data", "applications.md"),
    followUpCadenceFile: path.join(resolvedRoot, "followup-cadence.mjs"),
    reportsDirectory: path.join(resolvedRoot, "reports"),
    parserFile: path.join(resolvedRoot, "tracker-parse.mjs"),
  };
}

export function getCareerOpsPaths(
  env: NodeJS.ProcessEnv = process.env,
  cwd = process.cwd(),
): CareerOpsPaths {
  return resolveCareerOpsPaths(env.CAREER_OPS_ROOT?.trim() || "../career-ops", cwd);
}

export function getReportsDirectory(): string {
  return getCareerOpsPaths().reportsDirectory;
}
