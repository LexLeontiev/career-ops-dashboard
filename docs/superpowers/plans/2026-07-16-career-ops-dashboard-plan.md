# Career Ops Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the new dashboard design using Google Stitch MCP to generate the UI components, and integrate them into the React frontend.

**Architecture:** We will use Stitch MCP tools to create a Design System from our markdown spec, generate the Dashboard screen components based on that system, and then integrate the generated React components (`StatsOverview`, `FilterBar`, `DataTable`) into the existing Vite+React codebase, wiring them up to the existing state in `App.tsx`.

**Tech Stack:** React, Vite, CSS, Google Stitch (MCP)

## Global Constraints

- Must use the Stitch MCP tools for generating the initial CSS and React components.
- Components must be placed in `src/client/components/`.
- Must wire up correctly to the existing `App.tsx` state and API calls.
- The UI must match the dark theme and layout specified in the design spec.

---

### Task 1: Initialize Design System in Stitch

**Files:**
- Read: `docs/superpowers/specs/2026-07-16-career-ops-dashboard-design.md`

**Interfaces:**
- Produces: `designSystemId` in Stitch

- [ ] **Step 1: Read the design spec**

```bash
cat docs/superpowers/specs/2026-07-16-career-ops-dashboard-design.md
```

- [ ] **Step 2: Create Design System via Stitch MCP**
Use the `create_design_system_from_design_md` tool provided by the Stitch MCP server, passing the content of the design spec as the input. Note the returned `designSystemId`.

- [ ] **Step 3: Verify Design System**
Use the `list_design_systems` tool to verify the new design system exists and is active.

- [ ] **Step 4: Commit progress**

```bash
git commit --allow-empty -m "chore: initialize design system in stitch"
```

### Task 2: Generate Dashboard Screen via Stitch

**Files:**
- None modified locally yet.

**Interfaces:**
- Consumes: `designSystemId` from Task 1
- Produces: `screenId` and generated React code from Stitch.

- [ ] **Step 1: Generate Screen from Text**
Use the `generate_screen_from_text` tool. Provide a detailed prompt describing the Career Ops Dashboard layout (Stats Grid, Filter Bar with Chips, Data Table with Expandable Timeline rows) and pass the `designSystemId` from Task 1.

- [ ] **Step 2: Retrieve Screen Code**
Use `get_screen` to fetch the generated React component code and CSS from Stitch.

- [ ] **Step 3: Commit progress**

```bash
git commit --allow-empty -m "chore: generate dashboard screen in stitch"
```

### Task 3: Integrate Generated Components

**Files:**
- Modify: `src/client/components/StatsOverview.tsx`
- Modify: `src/client/components/FilterBar.tsx`
- Modify: `src/client/components/DataTable.tsx`
- Modify: `src/client/index.css`

**Interfaces:**
- Consumes: Generated React code from Stitch

- [ ] **Step 1: Update CSS**
Replace or append the generated design system CSS into `src/client/index.css`.

- [ ] **Step 2: Update Components**
Manually apply the generated UI structures to `StatsOverview.tsx`, `FilterBar.tsx`, and `DataTable.tsx`, ensuring that the props interfaces (`applications`, `onSelect`, etc.) match the existing `App.tsx` expectations.

- [ ] **Step 3: Update `App.tsx` State (if needed)**
If the filter chips or timeline expansion requires new state (e.g., toggling expanded rows), add it to `DataTable.tsx` or `App.tsx`. 

- [ ] **Step 4: Run Typecheck**

```bash
npx tsc --noEmit
```
Expected: PASS without errors.

- [ ] **Step 5: Commit**

```bash
git add src/client/
git commit -m "feat: integrate stitch generated ui components"
```
