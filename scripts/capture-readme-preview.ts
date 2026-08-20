import { spawn } from "node:child_process";
import { once } from "node:events";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";
import { createReadmeDemoData } from "./readme-demo-data.js";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const previewPath = path.join(repositoryRoot, "docs", "assets", "dashboard-preview.png");
const port = 4173;
const previewUrl = `http://127.0.0.1:${port}`;
const demoData = createReadmeDemoData();

const vite = spawn(
  "npm",
  ["exec", "vite", "--", "--host", "127.0.0.1", "--port", String(port), "--strictPort"],
  {
    cwd: repositoryRoot,
    stdio: ["ignore", "pipe", "pipe"],
  },
);

try {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Timed out while starting Vite for the README preview."));
    }, 15_000);
    const ready = (output: Buffer) => {
      if (output.toString().includes(previewUrl)) {
        clearTimeout(timeout);
        resolve();
      }
    };

    vite.stdout.on("data", ready);
    vite.stderr.on("data", ready);
    vite.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    vite.once("exit", (code) => {
      clearTimeout(timeout);
      reject(
        new Error(`Vite exited before the README preview was ready (code ${code ?? "unknown"}).`),
      );
    });
  });

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1100 },
      timezoneId: "Europe/Madrid",
      locale: "en-US",
    });
    await page.addInitScript(() => {
      localStorage.setItem("career_ops_theme", "dark");
      localStorage.setItem("career_ops_blur_mode", "false");
    });
    await page.route("**/api/applications", (route) =>
      route.fulfill({ json: demoData.applications }),
    );
    await page.route("**/api/reminders", (route) => route.fulfill({ json: demoData.reminders }));

    await page.goto(previewUrl, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Activity" }).waitFor();
    await page
      .getByText("Total Applications", { exact: true })
      .locator("xpath=..")
      .getByText("56", { exact: true })
      .waitFor();
    await page.screenshot({ path: previewPath });
  } finally {
    await browser.close();
  }
} finally {
  if (vite.exitCode === null) {
    const exited = once(vite, "exit");
    vite.kill("SIGTERM");
    await exited;
  }
}

console.log(`Updated ${path.relative(repositoryRoot, previewPath)} with synthetic demo data.`);
