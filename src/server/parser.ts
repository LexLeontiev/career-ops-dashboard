import fs from "node:fs";
import path from "node:path";
import { getApplicationsPath, careerOpsRoot } from "./config.js";

export async function parseApplicationsMD(): Promise<any[]> {
  const filePath = getApplicationsPath();
  if (!fs.existsSync(filePath)) {
    throw new Error(`Applications file not found at ${filePath}`);
  }

  // Dynamically import tracker-parse.mjs to prevent code duplication
  const parserPath = path.join(careerOpsRoot(), "tracker-parse.mjs");
  const parserUrl = `file://${parserPath}`;
  const trackerParse = await import(parserUrl);

  const lines = fs.readFileSync(filePath, "utf-8").split("\n");
  const colmap = trackerParse.resolveColumns(lines);

  const applications: any[] = [];
  for (const line of lines) {
    const row = trackerParse.parseTrackerRow(line, colmap);
    if (row) {
      applications.push({
        num: row.num,
        date: row.date,
        company: row.company,
        via: row.via || "—",
        role: row.role,
        score: row.score,
        status: row.status,
        pdf: row.pdf,
        report: (() => {
          const raw = row.report || "";
          const m = raw.match(/\[.*?\]\((.*?)\)/);
          const link = m ? m[1] : raw;
          return link.split('/').pop()?.trim() || "";
        })(),
        notes: row.notes,
      });
    }
  }

  return applications.sort((a, b) => b.num - a.num);
}
