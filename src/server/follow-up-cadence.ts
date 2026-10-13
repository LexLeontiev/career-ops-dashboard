import { execFile } from "node:child_process";
import { parseFollowUpCadence, type Reminder } from "../shared/reminder.js";
import { getCareerOpsPaths, type CareerOpsPaths } from "./config.js";

function runCadenceScript(paths: CareerOpsPaths): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [paths.followUpCadenceFile],
      {
        cwd: paths.root,
        env: {
          ...process.env,
          CAREER_OPS_ROOT: paths.dataRoot,
          CAREER_OPS_DATA_DIR: paths.dataRoot,
          CAREER_OPS_TRACKER: paths.applicationsFile,
        },
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
        timeout: 10_000,
      },
      (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      },
    );
  });
}

export async function loadFollowUpCadence(
  paths: CareerOpsPaths = getCareerOpsPaths(),
): Promise<Reminder[]> {
  const output = await runCadenceScript(paths);
  return parseFollowUpCadence(JSON.parse(output) as unknown);
}
