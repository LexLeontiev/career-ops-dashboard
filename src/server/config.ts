import { getCareerOpsPaths } from "./career-ops-paths.mjs";
export { getCareerOpsPaths, resolveCareerOpsPaths } from "./career-ops-paths.mjs";

export interface CareerOpsPaths {
  root: string;
  dataRoot: string;
  applicationsFile: string;
  followUpCadenceFile: string;
  reportsDirectory: string;
  parserFile: string;
}

export function getReportsDirectory(): string {
  return getCareerOpsPaths().reportsDirectory;
}
