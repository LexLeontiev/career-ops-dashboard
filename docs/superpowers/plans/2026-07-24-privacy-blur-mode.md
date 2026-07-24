# Privacy Blur Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Privacy Blur Mode to blur sensitive fields (Company Name, Role, and Comment/Notes) in the application list with a top-right toggle button and `localStorage` persistence.

**Architecture:** 
`App.tsx` holds `isBlurred` state initialized from `localStorage` ("career_ops_blur_mode"). A button with material-symbols `visibility`/`visibility_off` icons in the header toggles `isBlurred` and updates `localStorage`. The `isBlurred` state is passed as a prop to `DataTable.tsx`, which conditionally applies Tailwind blur & hover reveal classes to company, role, and comment fields.

**Tech Stack:** React, TypeScript, Tailwind CSS, Vite, Vitest.

## Global Constraints
- Preserve existing component props and default values when non-blurred.
- Use `localStorage` key `"career_ops_blur_mode"`.
- Use Tailwind CSS blur classes `blur-[4px] select-none hover:blur-none transition-all duration-200 cursor-pointer` when `isBlurred` is true.

---

### Task 1: Add `isBlurred` prop & blur styling to `DataTable.tsx` with Unit Tests

**Files:**
- Modify: `src/client/components/DataTable.tsx`
- Modify: `src/client/components/DataTable.test.tsx`

**Interfaces:**
- Consumes: `isBlurred?: boolean` optional prop in `DataTableProps`.
- Produces: `DataTable` component rendering blurred company, role, and notes elements when `isBlurred={true}`.

- [ ] **Step 1: Update `DataTable.test.tsx` with test for `isBlurred` prop**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DataTable, Application } from "./DataTable";

const mockApps: Application[] = [
  {
    num: 1,
    date: "2026-07-24",
    company: "Acme Inc",
    via: "LinkedIn",
    role: "Senior Engineer",
    score: "4.5",
    status: "APPLIED",
    report: "/reports/1.md",
    notes: "Great interview prep note"
  }
];

describe("DataTable Privacy Blur", () => {
  it("applies blur styling when isBlurred is true", () => {
    const { container } = render(
      <DataTable
        applications={mockApps}
        onSelect={() => {}}
        sortField=""
        sortOrder="asc"
        onSort={() => {}}
        isBlurred={true}
      />
    );

    const companyTd = screen.getByText("Acme Inc");
    expect(companyTd.className).toContain("blur-[4px]");
  });

  it("does not apply blur styling when isBlurred is false or undefined", () => {
    render(
      <DataTable
        applications={mockApps}
        onSelect={() => {}}
        sortField=""
        sortOrder="asc"
        onSort={() => {}}
        isBlurred={false}
      />
    );

    const companyTd = screen.getByText("Acme Inc");
    expect(companyTd.className).not.toContain("blur-[4px]");
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run src/client/components/DataTable.test.tsx`
Expected: FAIL with `blur-[4px]` not found in className.

- [ ] **Step 3: Update `DataTable.tsx` interface and cell class rendering**

Modify `DataTableProps` interface in `src/client/components/DataTable.tsx`:
```tsx
interface DataTableProps {
  applications: Application[];
  onSelect: (app: Application) => void;
  sortField: keyof Application | "";
  sortOrder: "asc" | "desc";
  onSort: (field: keyof Application) => void;
  isBlurred?: boolean;
}
```

In `DataTable.tsx`, define blur helper string:
```tsx
const blurClass = isBlurred ? "blur-[4px] select-none hover:blur-none transition-all duration-200 cursor-pointer" : "";
```

Apply `blurClass` to:
1. Company `<td>`:
```tsx
<td className={`px-6 py-5 font-bold text-white ${blurClass}`}>{app.company}</td>
```
2. Role `<td>`:
```tsx
<td className={`px-6 py-5 text-on-surface-variant ${blurClass}`}>{app.role}</td>
```
3. Comment `<div>` in table row:
```tsx
<td className="px-6 py-5 text-on-surface-variant text-body-sm">
  <div className={`line-clamp-2 ${blurClass}`} title={app.notes}>{app.notes}</div>
</td>
```
4. Expanded timeline notes `<p>`:
```tsx
<p className={`text-on-surface-variant text-body-sm max-w-2xl ${blurClass}`}>{app.notes}</p>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/client/components/DataTable.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/client/components/DataTable.tsx src/client/components/DataTable.test.tsx
git commit -m "feat: add isBlurred prop and blur styling to DataTable"
```

---

### Task 2: Implement header toggle button & state persistence in `App.tsx`

**Files:**
- Modify: `src/client/App.tsx`

**Interfaces:**
- Consumes: `localStorage.getItem("career_ops_blur_mode")`, `DataTableProps.isBlurred`.
- Produces: Persistent privacy toggle in application header.

- [ ] **Step 1: Update `App.tsx` with `isBlurred` state and header toggle button**

In `src/client/App.tsx`:
1. Read initial state from `localStorage`:
```tsx
const [isBlurred, setIsBlurred] = useState<boolean>(() => {
  return localStorage.getItem("career_ops_blur_mode") === "true";
});
```

2. Add toggle handler:
```tsx
const toggleBlur = () => {
  setIsBlurred((prev) => {
    const next = !prev;
    localStorage.setItem("career_ops_blur_mode", JSON.stringify(next));
    return next;
  });
};
```

3. Add toggle button in `<header>` right side:
```tsx
<header className="bg-surface-container-lowest dark:bg-surface-container-lowest w-full top-0 sticky z-50 border-b border-border-subtle dark:border-border-subtle">
  <div className="flex justify-between items-center w-full px-margin-desktop py-stack-md max-w-container-max mx-auto">
    <div className="flex items-center gap-stack-md cursor-pointer active:opacity-80 transition-all">
      <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim font-headline-md text-headline-md" data-icon="terminal">terminal</span>
      <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">Career Ops</h1>
    </div>
    
    <button
      onClick={toggleBlur}
      title={isBlurred ? "Disable privacy blur" : "Enable privacy blur"}
      className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-hover text-on-surface-variant transition-colors flex items-center gap-2 text-label-sm font-label-sm"
    >
      <span className="material-symbols-outlined text-[20px]">
        {isBlurred ? "visibility_off" : "visibility"}
      </span>
      <span>{isBlurred ? "Privacy On" : "Privacy Off"}</span>
    </button>
  </div>
</header>
```

4. Pass `isBlurred` to `DataTable`:
```tsx
<DataTable 
  applications={sortedApps}
  onSelect={setSelectedApp}
  sortField={sortField}
  sortOrder={sortOrder}
  onSort={handleSort}
  isBlurred={isBlurred}
/>
```

- [ ] **Step 2: Run all vitest tests to verify project integrity**

Run: `npx vitest run`
Expected: All tests PASS.

- [ ] **Step 3: Test production build / type check**

Run: `npx tsc --noEmit`
Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add src/client/App.tsx
git commit -m "feat: add top-right privacy blur toggle button and localStorage persistence"
```
