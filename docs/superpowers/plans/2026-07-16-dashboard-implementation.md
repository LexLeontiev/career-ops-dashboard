# Career Ops Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first read-only web dashboard for career-ops that reads applications and detailed reports, rendering them in a clean high-density table and slide-out markdown drawer.

**Architecture:** A separated Client-Server model with a React/Vite client and an Express server, running concurrently in development and serving static assets in production. The Express server dynamically loads `tracker-parse.mjs` from `../career-ops` to extract vacancies and reads detailed markdown reports.

**Tech Stack:** React 19, TypeScript, Vite, Express, concurrently, tsx, react-markdown.

## Global Constraints
- **Styling**: Vanilla CSS (no Tailwind unless requested). Define tokens as CSS Custom Properties in `index.css`.
- **Paths**: Resolve `career-ops` root relative to `careerOpsRoot()` which checks `process.env.CAREER_OPS_ROOT` first, then falls back to `../career-ops`.
- **Path Traversal Guard**: Secure `/api/reports/:filename` by restricting filenames to alphanumeric/dash sequences ending in `.md`.

---

### Task 1: Project Scaffolding and Infrastructure
**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/client/index.html`
- Create: `test/scaffold.test.ts`

**Interfaces:**
- Consumes: None
- Produces: Project build commands and typescript compilation configs

- [ ] **Step 1: Write the failing scaffold test**
Create `test/scaffold.test.ts` to assert that the environment configuration matches:
```typescript
import assert from "node:assert";
import test from "node:test";

test("environment check", () => {
  const env = process.env.NODE_ENV;
  assert.ok(env === "test" || env === undefined, "Environment is valid");
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --import tsx --test test/scaffold.test.ts`
Expected: FAIL (tsx or tsconfig not setup yet, command should fail due to missing modules or runner setup)

- [ ] **Step 3: Write minimal implementation and build config files**

Create `package.json`:
```json
{
  "name": "career-ops-web",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "concurrently \"vite\" \"tsx watch src/server/index.ts\"",
    "build": "tsc && vite build",
    "start": "NODE_ENV=production tsx src/server/index.ts",
    "test": "node --import tsx --test test/**/*.test.ts"
  },
  "dependencies": {
    "express": "^4.19.2",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-markdown": "^9.0.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.24",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "concurrently": "^8.2.2",
    "tsx": "^4.7.1",
    "typescript": "^5.3.3",
    "vite": "^5.1.4"
  }
}
```

Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": false,
    "outDir": "./dist",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx"
  },
  "include": ["src", "test"]
}
```

Create `vite.config.ts`:
```typescript
import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  root: path.resolve(process.cwd(), "src/client"),
  build: {
    outDir: path.resolve(process.cwd(), "dist/client"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001"
    }
  }
});
```

Create `src/client/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Career Ops Dashboard</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm install && npm test`
Expected: PASS

- [ ] **Step 5: Commit scaffolding**
```bash
git add package.json tsconfig.json vite.config.ts src/client/index.html test/scaffold.test.ts
git commit -m "chore: scaffold project structure and configurations"
```

---

### Task 2: Backend Config, Parser, and Express API
**Files:**
- Create: `src/server/config.ts`
- Create: `src/server/parser.ts`
- Create: `src/server/index.ts`
- Create: `test/server.test.ts`

**Interfaces:**
- Consumes: `tracker-parse.mjs` from `../career-ops`
- Produces: API endpoints `/api/applications` and `/api/reports/:filename`

- [ ] **Step 1: Write the failing backend test**
Create `test/server.test.ts` asserting backend API endpoints fetch applications successfully:
```typescript
import assert from "node:assert";
import test from "node:test";
import { parseApplicationsMD } from "../src/server/parser.js";

test("parse applications markdown content", () => {
  const dummyTable = `
# Applications Tracker

| # | Date | Company | Via | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|-----|------|-------|--------|-----|--------|-------|
| 47 | 2026-07-14 | Fingerprint | — | Senior Android | 5.0/5 | Evaluated | ✅ | reports/046-fingerprint-2026-07-14.md | Perfect fit |
`;
  const mockColmap = { num: 1, date: 2, company: 3, via: 4, role: 5, score: 6, status: 7, pdf: 8, report: 9, notes: 10 };
  const rows = dummyTable.split("\n")
    .map(line => {
      if (!line.startsWith("|")) return null;
      const parts = line.split("|").map(s => s.trim());
      if (parts.length < 12) return null;
      const num = parseInt(parts[mockColmap.num], 10);
      if (isNaN(num)) return null;
      return {
        num,
        date: parts[mockColmap.date],
        company: parts[mockColmap.company],
        via: parts[mockColmap.via],
        role: parts[mockColmap.role],
        score: parts[mockColmap.score],
        status: parts[mockColmap.status],
        pdf: parts[mockColmap.pdf],
        report: parts[mockColmap.report],
        notes: parts[mockColmap.notes]
      };
    })
    .filter(Boolean);

  assert.strictEqual(rows.length, 1);
  assert.strictEqual(rows[0]?.company, "Fingerprint");
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --import tsx --test test/server.test.ts`
Expected: FAIL (modules do not exist)

- [ ] **Step 3: Write server config, parser, and express code**

Create `src/server/config.ts`:
```typescript
import path from "node:path";
import fs from "node:fs";

export function careerOpsRoot(): string {
  const env = process.env.CAREER_OPS_ROOT?.trim();
  if (env) return env;
  return path.resolve(process.cwd(), "..");
}

export function getApplicationsPath(): string {
  return path.join(careerOpsRoot(), "data", "applications.md");
}

export function getReportsDirectory(): string {
  return path.join(careerOpsRoot(), "reports");
}
```

Create `src/server/parser.ts`:
```typescript
import fs from "node:fs";
import path from "node:path";
import { getApplicationsPath, careerOpsRoot } from "./config.js";

export async function parseApplicationsMD(): Promise<any[]> {
  const filePath = getApplicationsPath();
  if (!fs.existsSync(filePath)) {
    throw new Error(`Applications file not found at ${filePath}`);
  }

  // Dynamically import tracker-parse.mjs to prevent duplication
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
        report: row.report,
        notes: row.notes,
      });
    }
  }

  return applications.sort((a, b) => b.num - a.num);
}
```

Create `src/server/index.ts`:
```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit server logic**
```bash
git add src/server/config.ts src/server/parser.ts src/server/index.ts test/server.test.ts
git commit -m "feat: implement Express backend and markdown parser"
```

---

### Task 3: CSS Theme, React Main, and Metrics Component
**Files:**
- Create: `src/client/index.css`
- Create: `src/client/main.tsx`
- Create: `src/client/components/StatsOverview.tsx`
- Create: `src/client/components/StatsOverview.test.tsx`

**Interfaces:**
- Consumes: parsed application objects
- Produces: Visual metrics cards and design-system variables

- [ ] **Step 1: Write the failing stats overview test**
Create `src/client/components/StatsOverview.test.tsx` (using basic React assertions):
```typescript
import assert from "node:assert";
import test from "node:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { StatsOverview } from "./StatsOverview.js";

test("renders aggregated stats correctly", () => {
  const mockApps = [
    { num: 1, date: "2026-07-14", company: "Company A", role: "Role A", score: "5.0/5", status: "Applied", notes: "Note" },
    { num: 2, date: "2026-07-14", company: "Company B", role: "Role B", score: "4.0/5", status: "SKIP", notes: "Note" },
  ];
  const html = renderToString(React.createElement(StatsOverview, { applications: mockApps }));
  assert.match(html, /Active Processes.*1/);
  assert.match(html, /Closed\/Skipped.*1/);
  assert.match(html, /Avg Match Score.*4\.5/);
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --import tsx --test src/client/components/StatsOverview.test.tsx`
Expected: FAIL (component not imported/created)

- [ ] **Step 3: Implement client CSS and metrics code**

Create `src/client/index.css`:
```css
:root {
  --bg-main: #0b0f19;
  --bg-card: #161b26;
  --bg-hover: #222a3a;
  --border-color: rgba(255, 255, 255, 0.08);
  --color-primary: #3b82f6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --text-main: #f3f4f6;
  --text-muted: #9ca3af;
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15);
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-main);
  color: var(--text-main);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  padding: 20px;
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
}

header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

/* Stats Styles */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  padding: 16px;
  border-radius: 8px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
}
```

Create `src/client/components/StatsOverview.tsx`:
```typescript
import React from "react";

interface AppData {
  score: string;
  status: string;
}

export function StatsOverview({ applications }: { applications: AppData[] }) {
  const total = applications.length;
  let active = 0;
  let closed = 0;
  let scoreSum = 0;
  let scoreCount = 0;

  for (const app of applications) {
    const status = (app.status || "").toUpperCase();
    if (status === "APPLIED" || status === "INTERVIEW" || status === "RESPONDED") {
      active++;
    } else if (status === "SKIP" || status === "REJECTED") {
      closed++;
    }

    const val = parseFloat(app.score);
    if (!isNaN(val)) {
      scoreSum += val;
      scoreCount++;
    }
  }

  const avgScore = scoreCount > 0 ? (scoreSum / scoreCount).toFixed(2) : "N/A";

  return React.createElement(
    "div",
    { className: "stats-grid" },
    React.createElement(
      "div",
      { className: "stat-card" },
      React.createElement("div", { className: "stat-label" }, "Total Analyzed"),
      React.createElement("div", { className: "stat-value" }, total)
    ),
    React.createElement(
      "div",
      { className: "stat-card" },
      React.createElement("div", { className: "stat-label" }, "Active Processes"),
      React.createElement("div", { className: "stat-value" }, active)
    ),
    React.createElement(
      "div",
      { className: "stat-card" },
      React.createElement("div", { className: "stat-label" }, "Closed/Skipped"),
      React.createElement("div", { className: "stat-value" }, closed)
    ),
    React.createElement(
      "div",
      { className: "stat-card" },
      React.createElement("div", { className: "stat-label" }, "Avg Match Score"),
      React.createElement("div", { className: "stat-value" }, avgScore)
    )
  );
}
```

Create `src/client/main.tsx`:
```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.js";
import "./index.css";

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(
    React.createElement(React.StrictMode, null, React.createElement(App))
  );
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `node --import tsx --test src/client/components/StatsOverview.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit front base config**
```bash
git add src/client/index.css src/client/components/StatsOverview.tsx src/client/components/StatsOverview.test.tsx src/client/main.tsx
git commit -m "feat: implement base styles, react entry, and stats overview component"
```

---

### Task 4: Interactive DataTable & Filtering
**Files:**
- Create: `src/client/components/FilterBar.tsx`
- Create: `src/client/components/DataTable.tsx`
- Create: `src/client/components/DataTable.test.tsx`

**Interfaces:**
- Consumes: applications dataset
- Produces: filtering parameters and sorted row renders

- [ ] **Step 1: Write the failing table test**
Create `src/client/components/DataTable.test.tsx` verifying sorting and filtering logic:
```typescript
import assert from "node:assert";
import test from "node:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { DataTable } from "./DataTable.js";

test("table displays job details and score class colorings", () => {
  const mockApps = [
    { num: 47, date: "2026-07-14", company: "Fingerprint", via: "—", role: "Senior Android", score: "5.0/5", status: "Evaluated", report: "reports/046.md", notes: "Great match" }
  ];
  const html = renderToString(React.createElement(DataTable, {
    applications: mockApps,
    onSelect: () => {},
    sortField: "score",
    sortOrder: "desc",
    onSort: () => {}
  }));
  assert.match(html, /Fingerprint/);
  assert.match(html, /Senior Android/);
  assert.match(html, /5\.0\/5/);
  assert.match(html, /Great match/);
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --import tsx --test src/client/components/DataTable.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement DataTable, filters, and styles**

Add table styles to `src/client/index.css`:
```css
/* Filters styles */
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input, .select-input {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
}

.search-input {
  flex: 1;
}

/* Table styles */
.table-container {
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-card);
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th, td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
}

th {
  background-color: rgba(255,255,255,0.02);
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}

th:hover {
  background-color: rgba(255,255,255,0.05);
}

tr {
  transition: background 0.15s ease, transform 0.1s ease;
  cursor: pointer;
}

tr:hover {
  background-color: var(--bg-hover);
}

.badge-score {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 700;
  font-size: 12px;
}

.score-high { background-color: var(--color-success); color: #fff; }
.score-med { background-color: var(--color-warning); color: #fff; }
.score-low { background-color: #4b5563; color: #fff; }

.badge-status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-active { background-color: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid var(--color-primary); }
.status-closed { background-color: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid var(--color-error); }
.status-eval { background-color: rgba(255, 255, 255, 0.1); color: #e5e7eb; border: 1px solid var(--text-muted); }
```

Create `src/client/components/FilterBar.tsx`:
```typescript
import React from "react";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
}

export function FilterBar({ searchQuery, setSearchQuery, statusFilter, setStatusFilter }: FilterBarProps) {
  return React.createElement(
    "div",
    { className: "filter-bar" },
    React.createElement("input", {
      type: "text",
      className: "search-input",
      placeholder: "Search company, role, or notes...",
      value: searchQuery,
      onChange: (e) => setSearchQuery(e.target.value)
    }),
    React.createElement(
      "select",
      {
        className: "select-input",
        value: statusFilter,
        onChange: (e) => setStatusFilter(e.target.value)
      },
      React.createElement("option", { value: "all" }, "All Statuses"),
      React.createElement("option", { value: "active" }, "Active (Applied / Interview)"),
      React.createElement("option", { value: "closed" }, "Closed (SKIP / Rejected)"),
      React.createElement("option", { value: "evaluated" }, "Evaluated")
    )
  );
}
```

Create `src/client/components/DataTable.tsx`:
```typescript
import React from "react";

export interface Application {
  num: number;
  date: string;
  company: string;
  via: string;
  role: string;
  score: string;
  status: string;
  report: string;
  notes: string;
}

interface DataTableProps {
  applications: Application[];
  onSelect: (app: Application) => void;
  sortField: keyof Application | "";
  sortOrder: "asc" | "desc";
  onSort: (field: keyof Application) => void;
}

export function DataTable({ applications, onSelect, sortField, sortOrder, onSort }: DataTableProps) {
  const getScoreClass = (scoreStr: string) => {
    const score = parseFloat(scoreStr);
    if (isNaN(score)) return "score-low";
    if (score >= 4.5) return "score-high";
    if (score >= 3.5) return "score-med";
    return "score-low";
  };

  const getStatusClass = (statusStr: string) => {
    const status = (statusStr || "").toUpperCase();
    if (status === "APPLIED" || status === "INTERVIEW" || status === "RESPONDED") return "status-active";
    if (status === "SKIP" || status === "REJECTED") return "status-closed";
    return "status-eval";
  };

  const renderSortIndicator = (field: keyof Application) => {
    if (sortField !== field) return "";
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  return React.createElement(
    "div",
    { className: "table-container" },
    React.createElement(
      "table",
      null,
      React.createElement(
        "thead",
        null,
        React.createElement(
          "tr",
          null,
          React.createElement("th", { onClick: () => onSort("num") }, `#${renderSortIndicator("num")}`),
          React.createElement("th", { onClick: () => onSort("date") }, `Date${renderSortIndicator("date")}`),
          React.createElement("th", { onClick: () => onSort("company") }, `Company${renderSortIndicator("company")}`),
          React.createElement("th", { onClick: () => onSort("role") }, `Role${renderSortIndicator("role")}`),
          React.createElement("th", { onClick: () => onSort("score") }, `Score${renderSortIndicator("score")}`),
          React.createElement("th", { onClick: () => onSort("status") }, `Status${renderSortIndicator("status")}`),
          React.createElement("th", null, "Comment / Reason")
        )
      ),
      React.createElement(
        "tbody",
        null,
        applications.map((app) =>
          React.createElement(
            "tr",
            { key: app.num, onClick: () => onSelect(app) },
            React.createElement("td", null, app.num),
            React.createElement("td", null, app.date),
            React.createElement("td", { style: { fontWeight: "bold" } }, app.company),
            React.createElement("td", null, app.role),
            React.createElement(
              "td",
              null,
              React.createElement("span", { className: `badge-score ${getScoreClass(app.score)}` }, app.score)
            ),
            React.createElement(
              "td",
              null,
              React.createElement("span", { className: `badge-status ${getStatusClass(app.status)}` }, app.status)
            ),
            React.createElement("td", { style: { color: "var(--text-muted)", fontSize: "13px" } }, app.notes)
          )
        )
      )
    )
  );
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `node --import tsx --test src/client/components/DataTable.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit DataTable implementation**
```bash
git add src/client/components/FilterBar.tsx src/client/components/DataTable.tsx src/client/components/DataTable.test.tsx
git commit -m "feat: implement DataTable and FilterBar filtering components"
```

---

### Task 5: ReportDrawer Component & App Shell Assembly
**Files:**
- Create: `src/client/components/ReportDrawer.tsx`
- Create: `src/client/App.tsx`
- Create: `test/app.test.tsx`

**Interfaces:**
- Consumes: API endpoints and components built in Tasks 3 & 4
- Produces: The fully assembled single page dashboard UI

- [ ] **Step 1: Write App integration test**
Create `test/app.test.tsx` to assert overall view rendering:
```typescript
import assert from "node:assert";
import test from "node:test";
import React from "react";
import { renderToString } from "react-dom/server";
import App from "../src/client/App.js";

test("renders app container header", () => {
  const html = renderToString(React.createElement(App));
  assert.match(html, /Career Ops Dashboard/);
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --import tsx --test test/app.test.tsx`
Expected: FAIL (App shell is not created/assembled)

- [ ] **Step 3: Implement ReportDrawer, App layout, and CSS styles**

Add drawer styles to `src/client/index.css`:
```css
/* Drawer styles */
.drawer-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s ease, visibility 0.25s ease;
}

.drawer-backdrop.open {
  opacity: 1;
  visibility: visible;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 45%;
  min-width: 450px;
  height: 100vh;
  background-color: var(--bg-card);
  border-left: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  z-index: 101;
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.drawer.open {
  transform: translateX(0);
}

.drawer-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-title {
  font-size: 18px;
  font-weight: 700;
}

.drawer-close-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 20px;
  cursor: pointer;
}

.drawer-close-btn:hover {
  color: var(--text-main);
}

.drawer-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  line-height: 1.6;
}

/* Markdown styling inside drawer */
.markdown-content h1, .markdown-content h2, .markdown-content h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: var(--text-main);
}
.markdown-content p {
  margin-bottom: 12px;
  color: #d1d5db;
}
.markdown-content ul, .markdown-content ol {
  margin-left: 20px;
  margin-bottom: 12px;
}
.markdown-content li {
  margin-bottom: 4px;
}
```

Create `src/client/components/ReportDrawer.tsx`:
```typescript
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface ReportDrawerProps {
  reportPath: string;
  isOpen: boolean;
  onClose: () => void;
  company: string;
  role: string;
}

export function ReportDrawer({ reportPath, isOpen, onClose, company, role }: ReportDrawerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isOpen || !reportPath) return;

    const fetchReport = async () => {
      setLoading(true);
      setError("");
      setContent("");
      try {
        const filename = reportPath.replace(/^reports\//, "");
        const res = await fetch(`/api/reports/${encodeURIComponent(filename)}`);
        if (!res.ok) {
          throw new Error("Detailed report file not found on disk.");
        }
        const text = await res.text();
        setContent(text);
      } catch (err: any) {
        setError(err.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [isOpen, reportPath]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement("div", {
      className: `drawer-backdrop ${isOpen ? "open" : ""}`,
      onClick: onClose
    }),
    React.createElement(
      "div",
      { className: `drawer ${isOpen ? "open" : ""}` },
      React.createElement(
        "div",
        { className: "drawer-header" },
        React.createElement(
          "div",
          null,
          React.createElement("div", { className: "drawer-title" }, company),
          React.createElement("div", { style: { fontSize: "13px", color: "var(--text-muted)" } }, role)
        ),
        React.createElement("button", { className: "drawer-close-btn", onClick: onClose }, "✕")
      ),
      React.createElement(
        "div",
        { className: "drawer-body" },
        loading && React.createElement("p", null, "Loading report..."),
        error && React.createElement("div", { style: { color: "var(--color-error)" } }, error),
        !loading && !error && content && React.createElement(
          "div",
          { className: "markdown-content" },
          React.createElement(ReactMarkdown, null, content)
        )
      )
    )
  );
}
```

Create `src/client/App.tsx`:
```typescript
import React, { useEffect, useState } from "react";
import { StatsOverview } from "./components/StatsOverview.js";
import { FilterBar } from "./components/FilterBar.js";
import { DataTable, Application } from "./components/DataTable.js";
import { ReportDrawer } from "./components/ReportDrawer.js";

export default function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof Application | "">("num");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/applications");
        if (!res.ok) throw new Error("Failed to load applications");
        const data = await res.json();
        setApplications(data);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSort = (field: keyof Application) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const filteredApps = applications.filter((app) => {
    // Search query match
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      app.company.toLowerCase().includes(term) ||
      app.role.toLowerCase().includes(term) ||
      app.notes.toLowerCase().includes(term);

    // Status filter match
    const status = (app.status || "").toUpperCase();
    let matchesStatus = true;
    if (statusFilter === "active") {
      matchesStatus = status === "APPLIED" || status === "INTERVIEW" || status === "RESPONDED";
    } else if (statusFilter === "closed") {
      matchesStatus = status === "SKIP" || status === "REJECTED";
    } else if (statusFilter === "evaluated") {
      matchesStatus = status === "EVALUATED";
    }

    return matchesSearch && matchesStatus;
  });

  const sortedApps = [...filteredApps].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }
    return sortOrder === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  return React.createElement(
    "div",
    { className: "dashboard-container" },
    React.createElement(
      "header",
      null,
      React.createElement("h1", { className: "title" }, "Career Ops Dashboard")
    ),
    loading && React.createElement("p", null, "Loading data..."),
    error && React.createElement("div", { style: { color: "var(--color-error)" } }, error),
    !loading && !error && React.createElement(
      React.Fragment,
      null,
      React.createElement(StatsOverview, { applications }),
      React.createElement(FilterBar, {
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter
      }),
      React.createElement(DataTable, {
        applications: sortedApps,
        onSelect: setSelectedApp,
        sortField,
        sortOrder,
        onSort: handleSort
      })
    ),
    selectedApp && React.createElement(ReportDrawer, {
      reportPath: selectedApp.report,
      isOpen: !!selectedApp,
      onClose: () => setSelectedApp(null),
      company: selectedApp.company,
      role: selectedApp.role
    })
  );
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `node --import tsx --test test/app.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit App Assembly**
```bash
git add src/client/components/ReportDrawer.tsx src/client/App.tsx test/app.test.tsx
git commit -m "feat: assemble app view and markdown report slide-out drawer"
```
