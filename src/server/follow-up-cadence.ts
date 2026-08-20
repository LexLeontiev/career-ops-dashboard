import { execFile } from "node:child_process";
import { parseFollowUpCadence, type Reminder } from "../shared/reminder.js";
import { getCareerOpsPaths, type CareerOpsPaths } from "./config.js";

function runCadenceScript(scriptFile: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [scriptFile],
      { encoding: "utf8", maxBuffer: 10 * 1024 * 1024, timeout: 10_000 },
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
  const output = await runCadenceScript(paths.followUpCadenceFile);
  return parseFollowUpCadence(JSON.parse(output) as unknown);
}
