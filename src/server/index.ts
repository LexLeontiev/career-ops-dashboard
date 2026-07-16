import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseApplicationsMD } from "./parser.js";
import { getReportsDirectory } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.get("/api/applications", async (req, res) => {
  try {
    const data = await parseApplicationsMD();
    res.json(data);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Failed to read applications tracker" });
  }
});

app.get("/api/reports/:filename", (req, res) => {
  const filename = req.params.filename;
  // Guard: allow only safe report filenames, preventing directory traversal
  if (!/^[a-zA-Z0-9\-_]+\.md$/.test(filename)) {
    return res.status(400).json({ error: "Invalid report filename format" });
  }

  const reportsDir = getReportsDirectory();
  const filePath = path.join(reportsDir, filename);

  // Path resolution sanity check
  if (!filePath.startsWith(reportsDir)) {
    return res.status(403).json({ error: "Access denied" });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: `Report ${filename} not found` });
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    res.send(content);
  } catch (error) {
    res.status(500).json({ error: "Failed to read report content" });
  }
});

// Production: serve built static files
if (process.env.NODE_ENV === "production") {
  const staticDir = path.resolve(__dirname, "../client");
  app.use(express.static(staticDir));
  app.get("*", (req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
