# Offers Metric and Interview Stage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an "Offers" metric block to the dashboard header stats with dynamic highlighting, rename "Interview Count" to "Interview Stage", and update stats cards layout to be responsive (5 cards in 1 row on desktop, 2+3 on tablet, 2+2+1 on mobile).

**Architecture:** Modify `src/client/components/StatsOverview.tsx` to compute `offers` status count, style the card dynamically based on `offers > 0`, update label text to "Interview Stage", and adjust CSS grid container classes. Update unit tests in `src/client/components/StatsOverview.test.tsx`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Node test runner (`node:test`, `node:assert`).

## Global Constraints
- Target files: `src/client/components/StatsOverview.tsx`, `src/client/components/StatsOverview.test.tsx`.
- All tests must pass using `npm test`.

---

### Task 1: Update StatsOverview component and test suite

**Files:**
- Modify: `src/client/components/StatsOverview.tsx`
- Modify: `src/client/components/StatsOverview.test.tsx`

**Interfaces:**
- Consumes: `applications: AppData[]` (`AppData` interface with `score: string; status: string;`)
- Produces: Updated JSX element with 5 responsive cards

- [ ] **Step 1: Write the failing tests for Offers metric and Interview Stage label**

Edit `src/client/components/StatsOverview.test.tsx`:
```tsx
import assert from "node:assert";
import test from "node:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { StatsOverview } from "./StatsOverview.js";

test("renders aggregated stats correctly including Interview Stage and Offers", () => {
  const mockApps = [
    { num: 1, date: "2026-07-14", company: "Company A", role: "Role A", score: "5.0/5", status: "Applied", notes: "Note" },
    { num: 2, date: "2026-07-14", company: "Company B", role: "Role B", score: "4.0/5", status: "SKIP", notes: "Note" },
    { num: 3, date: "2026-07-14", company: "Company C", role: "Role C", score: "4.5/5", status: "Offer", notes: "Note" },
  ];
  const html = renderToString(React.createElement(StatsOverview, { applications: mockApps }));
  assert.match(html, /Active Processes.*1/);
  assert.match(html, /Interview Stage.*0/);
  assert.match(html, /Offers.*1/);
  assert.match(html, /text-emerald-400/);
  assert.match(html, /Responded Rate.*0.*%/);
});

test("renders unhighlighted Offers card when offer count is 0", () => {
  const mockApps = [
    { num: 1, date: "2026-07-14", company: "Company A", role: "Role A", score: "5.0/5", status: "Applied", notes: "Note" },
  ];
  const html = renderToString(React.createElement(StatsOverview, { applications: mockApps }));
  assert.match(html, /Offers.*0/);
  assert.doesNotMatch(html, /text-emerald-400/);
});

test("calculates Responded Rate correctly for processed/response statuses (Rejected, Interview, Discarded, Offer)", () => {
  const mockApps = [
    { num: 1, date: "2026-07-14", company: "Company A", role: "Role A", score: "5.0/5", status: "Applied", notes: "Note" },
    { num: 2, date: "2026-07-14", company: "Company B", role: "Role B", score: "4.0/5", status: "Rejected", notes: "Note" },
    { num: 3, date: "2026-07-14", company: "Company C", role: "Role C", score: "4.0/5", status: "Interview", notes: "Note" },
    { num: 4, date: "2026-07-14", company: "Company D", role: "Role D", score: "4.0/5", status: "EVALUATED", notes: "Note" },
  ];
  const html = renderToString(React.createElement(StatsOverview, { applications: mockApps }));
  assert.match(html, /Responded Rate.*67.*%/);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected output: FAIL with missing `/Interview Stage/` or `/Offers/` regex match.

- [ ] **Step 3: Implement updated StatsOverview.tsx**

Edit `src/client/components/StatsOverview.tsx`:
```tsx
import React from "react";

interface AppData {
  score: string;
  status: string;
}

export function StatsOverview({ applications }: { applications: AppData[] }) {
  const total = applications.length;
  let active = 0;
  let interviews = 0;
  let offers = 0;
  let responded = 0;
  let applied = 0;

  for (const app of applications) {
    const status = (app.status || "").toUpperCase();
    
    if (status !== "SKIP" && status !== "EVALUATED" && status !== "") {
      applied++;
      if (status !== "APPLIED") {
        responded++;
      }
    }

    if (status === "APPLIED" || status === "INTERVIEW" || status === "RESPONDED") {
      active++;
    }
    if (status === "INTERVIEW") {
      interviews++;
    }
    if (status === "OFFER") {
      offers++;
    }
  }

  const respondedRate = applied > 0 ? Math.round((responded / applied) * 100) : 0;
  const hasOffers = offers > 0;

  return (
    <section className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-5 gap-gutter mb-stack-lg">
      <div className="col-span-1 md:col-span-3 lg:col-span-1 bg-surface-card p-6 rounded-xl border border-border-subtle hover:border-primary/50 transition-colors">
        <div className="text-text-secondary font-label-sm text-label-sm uppercase mb-2">Total Analyzed</div>
        <div className="text-white font-headline-lg text-headline-lg">{total}</div>
      </div>
      <div className="col-span-1 md:col-span-3 lg:col-span-1 bg-surface-card p-6 rounded-xl border border-border-subtle hover:border-primary/50 transition-colors">
        <div className="text-text-secondary font-label-sm text-label-sm uppercase mb-2">Active Processes</div>
        <div className="text-primary font-headline-lg text-headline-lg">{active}</div>
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-surface-card p-6 rounded-xl border border-border-subtle hover:border-primary/50 transition-colors">
        <div className="text-text-secondary font-label-sm text-label-sm uppercase mb-2">Interview Stage</div>
        <div className="text-secondary font-headline-lg text-headline-lg">{interviews}</div>
      </div>
      <div className={`col-span-1 md:col-span-2 lg:col-span-1 bg-surface-card p-6 rounded-xl border transition-colors ${
        hasOffers ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-400" : "border-border-subtle hover:border-primary/50"
      }`}>
        <div className="text-text-secondary font-label-sm text-label-sm uppercase mb-2">Offers</div>
        <div className={`font-headline-lg text-headline-lg ${hasOffers ? "text-emerald-400 font-bold" : "text-text-secondary"}`}>{offers}</div>
      </div>
      <div className="col-span-2 md:col-span-2 lg:col-span-1 bg-surface-card p-6 rounded-xl border border-border-subtle hover:border-primary/50 transition-colors">
        <div className="text-text-secondary font-label-sm text-label-sm uppercase mb-2">Responded Rate</div>
        <div className="text-tertiary font-headline-lg text-headline-lg">{respondedRate}%</div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected output: All tests PASS (6/6 or 7/7).

- [ ] **Step 5: Commit changes**

```bash
git add src/client/components/StatsOverview.tsx src/client/components/StatsOverview.test.tsx
git commit -m "feat: add Offers metric and rename Interview Count to Interview Stage"
```
