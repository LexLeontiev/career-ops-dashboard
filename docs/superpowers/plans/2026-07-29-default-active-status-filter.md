# Default Active Status Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set the default status filter to "active" positions on initial page load and reorder the status filter controls in `FilterBar` (desktop pills and mobile dropdown) so Active and Evaluated appear first, followed by All Statuses and the visual separator.

**Architecture:** Update initial state in `App.tsx` and control rendering order in `FilterBar.tsx`. Add unit tests in `FilterBar.test.tsx` to verify option order.

**Tech Stack:** React 18, TypeScript, Node.js test runner.

## Global Constraints

- Default status filter is `"active"`.
- Control order before separator: Active, Evaluated, All Statuses.
- Control order after separator: Applied, Interview, Skip, Rejected, Discarded (unchanged).

---

### Task 1: Update Default Status Filter and Reorder FilterBar Options

**Files:**
- Modify: `src/client/App.tsx`
- Modify: `src/client/components/FilterBar.tsx`
- Modify: `src/client/components/FilterBar.test.tsx`

**Interfaces:**
- Consumes: `FilterBarProps` (`searchQuery`, `setSearchQuery`, `statusFilter`, `setStatusFilter`, `counts`)
- Produces: Updated status option rendering order in `<select>` and desktop buttons.

- [ ] **Step 1: Write failing test in FilterBar.test.tsx**

Update `src/client/components/FilterBar.test.tsx` to assert that Active is the first option in the `<select>` element and that option elements follow the new order.

```tsx
import assert from "node:assert";
import test from "node:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { FilterBar } from "./FilterBar.js";

test("renders status select dropdown for mobile screens with correct counts and new option order", () => {
  const counts = {
    all: 10,
    active: 4,
    evaluated: 2,
    applied: 2,
    interview: 2,
    skip: 1,
    rejected: 2,
    discarded: 1,
  };
  const html = renderToString(
    React.createElement(FilterBar, {
      searchQuery: "",
      setSearchQuery: () => {},
      statusFilter: "active",
      setStatusFilter: () => {},
      counts,
    })
  );

  assert.match(html, /<select/);
  assert.match(html, /id="status-select"/);

  // Verify Active comes before Evaluated, and Evaluated comes before All Statuses in html
  const activeIdx = html.indexOf('value="active"');
  const evaluatedIdx = html.indexOf('value="evaluated"');
  const allIdx = html.indexOf('value="all"');

  assert.ok(activeIdx !== -1, "active option exists");
  assert.ok(evaluatedIdx !== -1, "evaluated option exists");
  assert.ok(allIdx !== -1, "all option exists");
  assert.ok(activeIdx < evaluatedIdx, "Active appears before Evaluated");
  assert.ok(evaluatedIdx < allIdx, "Evaluated appears before All Statuses");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL due to `value="all"` currently appearing before `value="active"`.

- [ ] **Step 3: Update App.tsx and FilterBar.tsx implementation**

In `src/client/App.tsx`:
Change `const [statusFilter, setStatusFilter] = useState("all");` to `const [statusFilter, setStatusFilter] = useState("active");`.

In `src/client/components/FilterBar.tsx`:
Reorder dropdown options and desktop pill buttons to:
1. Active
2. Evaluated
3. All Statuses
--- Divider ---
4. Applied
5. Interview
6. Skip
7. Rejected
8. Discarded

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS with 10 passing tests.

- [ ] **Step 5: Commit changes**

```bash
git add src/client/App.tsx src/client/components/FilterBar.tsx src/client/components/FilterBar.test.tsx
git commit -m "feat: default status filter to active and reorder filter buttons"
```
