# Design Spec: Career Ops Web Dashboard
Date: 2026-07-14
Status: Approved

## 1. Overview
The goal of this project is to create a standalone, local-first web interface for the `career-ops` application tracker. The primary feature is a highly polished dashboard containing an interactive, high-density data table of all analyzed vacancies, their scores, current statuses, and the rationale comments (reasons for fitting or not fitting). Clicking on a vacancy dynamically loads and renders the corresponding full Markdown evaluation report in a slide-out drawer panel.

## 2. Architecture & Tech Stack
The project will be built from scratch in the `career-ops-web` directory. It uses a separated but co-located Client-Server architecture:

- **Frontend**: React (v19) + Vite + Vanilla CSS (CSS Modules) + TypeScript.
- **Backend**: Node.js + Express + TypeScript.
- **Styling**: Vanilla CSS utilizing CSS custom properties (variables) for theme definitions and smooth micro-animations.
- **Database / Data Source**: Directly reads and parses `../career-ops/data/applications.md` and `../career-ops/reports/*.md`.

### Directory Structure
```
career-ops-web/
├── package.json               # Scripts, workspace dependencies
├── tsconfig.json              # TypeScript compilation setup
├── vite.config.ts             # Vite configuration with proxy settings to Express port (3001)
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-07-14-dashboard-design.md  # This spec file
├── src/
│   ├── client/                # React application
│   │   ├── main.tsx           # React bootstrap entry point
│   │   ├── index.css          # Design system variables, global resets
│   │   ├── App.tsx            # Main state manager and layout container
│   │   ├── components/
│   │   │   ├── StatsOverview.tsx   # Aggregated pipeline metrics
│   │   │   ├── FilterBar.tsx       # Live search and status/score filters
│   │   │   ├── DataTable.tsx       # Sorted & styled applications list
│   │   │   └── ReportDrawer.tsx    # Slide-out Markdown report renderer
│   │   └── utils/
│   │       └── formatters.ts  # Date and score presentation utilities
│   │
│   └── server/                # Node.js Express server
│       ├── index.ts           # Express setup and routes
│       ├── parser.ts          # Safe wrapper importing tracker-parse.mjs from career-ops
│       └── config.ts          # Core paths resolver and environment variables
```

## 3. Data Integration & API Contract
To prevent drift, the Express server resolves the path to the `career-ops` repository (defaulting to `../career-ops` or using the `CAREER_OPS_ROOT` env variable) and dynamically loads the original `tracker-parse.mjs` module.

### API Endpoints

#### 1. `GET /api/applications`
Returns a JSON array of parsed rows from `data/applications.md` in descending order by vacancy number.

**Response format:**
```json
[
  {
    "num": 47,
    "date": "2026-07-14",
    "company": "Fingerprint",
    "via": "—",
    "role": "Senior Android Engineer",
    "score": "5.0/5",
    "status": "Evaluated",
    "pdf": "✅",
    "report": "reports/046-fingerprint-2026-07-14.md",
    "notes": "Perfect fit (10+ years experience, expert Kotlin/Compose, intermediate C++, security-focused SDK design, and 100% remote global hiring)."
  }
]
```

#### 2. `GET /api/reports/:filename`
Returns the raw content of the Markdown file requested.
- **Safety check**: Validates that `:filename` matches a alphanumeric/dash-separated file ending in `.md` (preventing directory traversal outside the `reports/` folder).

**Response format:**
```text
(Raw Markdown text of the report)
```

## 4. UI/UX Design System
A premium dark-themed experience with fluid interactions, modern typography (using systemic sans-serif system fonts: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`), and micro-animations.

### CSS Custom Variables
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
```

### Components Specification

#### StatsOverview
Calculates and renders summary cards:
- **Total Evaluated**: Total count of entries in the file.
- **Active Processes**: Count of rows with status `Applied` or `Interview`.
- **Closed / Skipped**: Count of rows with status `SKIP` or `Rejected`.
- **Average Match Score**: Mean score computed from rows having numerical scores (e.g., `X.X/5`).

#### DataTable
Renders the applications list:
- Columns: `#`, `Date`, `Company`, `Role`, `Score`, `Status`, `Comment / Reason`.
- Clicking column headers sorts ascending/descending.
- Score column highlights: green badge for scores `>= 4.5`, orange badge for `>= 3.5`, gray for lesser/sentinel scores.
- Status column shows distinct pill badges: blue for `Applied`/`Interview`, gray for `Evaluated`, red for `Rejected`/`SKIP`.
- Row hover transition: smooth shift and highlight (`transition: background 0.15s ease, transform 0.1s ease`).

#### ReportDrawer
Slide-out detail view:
- Opens from the right side, occupying 40% of the viewport width.
- Animated using `transform: translateX(100%)` (closed) to `transform: translateX(0)` (open) with a smooth easing curve.
- Focus-trapped with keyboard listeners to close on `Escape` key.
- Renders Markdown via `react-markdown` to display rich summaries, sections, and checklists.

## 5. Resilience & Error Handling
- **Database missing**: If `data/applications.md` is unreachable, API responds with `{ error: "DATABASE_NOT_FOUND", path: "/..." }`. The frontend renders a helpful instructions page suggesting setting `CAREER_OPS_ROOT`.
- **Malformed lines**: The server catches parsing exceptions per line, logs a warning, and continues processing the rest of the file.
- **Report file missing**: If a report file link is broken, requesting `/api/reports/:filename` returns a `404` status. The drawer shows an alert: "Detailed report file not found on disk."

## 6. Verification Plan
- **Backend parsing test**: Direct verification of the Express API output when reading `data/applications.md`.
- **Frontend layout testing**: Validating that sorting and text searching function instantly in the client.
- **Report traversal check**: Asserting that `/api/reports/` blocks relative paths (`../`, `..%2F`) and restricts files only to `.md` format.
