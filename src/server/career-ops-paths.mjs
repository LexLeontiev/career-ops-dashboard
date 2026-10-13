import { existsSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";

/** @param {string} root */
function readDataMarker(root) {
  try {
    return readFileSync(path.join(root, ".career-ops-data"), "utf8").trim();
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

/**
 * Resolve data separately from scripts. This module also runs in bin/start.sh
 * before npm dependencies have been installed.
 * @param {string} root Checkout path
 * @param {string} cwd
 * @param {NodeJS.ProcessEnv} env
 */
export function resolveCareerOpsPaths(root, cwd = process.cwd(), env = {}) {
  let resolvedRoot = path.resolve(cwd, root);
  // Node resolves upstream modules through checkout symlinks. Anchor relative
  // data paths to that same physical directory, including paths containing .. .
  if (existsSync(resolvedRoot)) resolvedRoot = realpathSync(resolvedRoot);
  const dataSetting = env.CAREER_OPS_ROOT?.trim() || env.CAREER_OPS_DATA_DIR?.trim();
  const dataRoot = path.resolve(resolvedRoot, dataSetting || readDataMarker(resolvedRoot) || ".");
  const nestedTracker = path.join(dataRoot, "data", "applications.md");
  const rootTracker = path.join(dataRoot, "applications.md");
  const trackerOverride = env.CAREER_OPS_TRACKER?.trim();
  return {
    root: resolvedRoot,
    dataRoot,
    applicationsFile: trackerOverride
      ? path.resolve(cwd, trackerOverride)
      : !existsSync(nestedTracker) && existsSync(rootTracker)
        ? rootTracker
        : nestedTracker,
    followUpCadenceFile: path.join(resolvedRoot, "followup-cadence.mjs"),
    reportsDirectory: path.join(dataRoot, "reports"),
    parserFile: path.join(resolvedRoot, "tracker-parse.mjs"),
  };
}

/** @param {NodeJS.ProcessEnv} env @param {string} cwd */
export function getCareerOpsPaths(env = process.env, cwd = process.cwd()) {
  const explicitCodeRoot = env.CAREER_OPS_CODE_ROOT?.trim();
  const rootSetting = env.CAREER_OPS_ROOT?.trim();
  const configuredRoot = rootSetting ? path.resolve(cwd, rootSetting) : undefined;
  // Older dashboard versions used ROOT for the checkout. Recognize that layout
  // while supporting upstream's ROOT=data convention for a data-only directory.
  // Keep nonexistent legacy paths intact so startup can diagnose a missing clone.
  const legacyCodeRoot =
    !explicitCodeRoot &&
    configuredRoot &&
    (!existsSync(configuredRoot) ||
      existsSync(path.join(configuredRoot, "tracker-parse.mjs")) ||
      existsSync(path.join(configuredRoot, "package.json")));
  const root = explicitCodeRoot || (legacyCodeRoot ? configuredRoot : "../career-ops");
  return resolveCareerOpsPaths(root, cwd, {
    ...env,
    CAREER_OPS_ROOT: legacyCodeRoot ? undefined : rootSetting,
  });
}
