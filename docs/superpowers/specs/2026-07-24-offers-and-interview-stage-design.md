# Offers Metric & Interview Stage Refactoring Design

## Overview
Enhance the Career Ops dashboard header statistics section by:
1. Renaming the "Interview Count" metric to "Interview Stage".
2. Adding a new "Offers" metric block to track applications with status `OFFER`.
3. Applying dynamic styling to the Offers card (muted when 0 offers, vibrant emerald/green highlight when > 0 offers).
4. Restructuring the 5 stats cards using a responsive CSS Grid:
   - **Desktop (`lg` ≥ 1024px)**: 5 cards in 1 row (5 cols).
   - **Tablet (`md` 768px - 1023px)**: 2 rows layout (2 cards top row, 3 cards bottom row).
   - **Mobile (`< md`)**: 3 rows layout (2 cards top, 2 cards middle, 1 full-width card for Responded Rate).

---

## 1. Metric Calculations & Definitions

### Stats Overview Data
- **Total Analyzed**: `applications.length`
- **Active Processes**: Count of applications with status `APPLIED`, `INTERVIEW`, or `RESPONDED`.
- **Interview Stage**: Count of applications with status `INTERVIEW`. (Renamed from "Interview Count").
- **Offers**: Count of applications with status `OFFER`. (New Metric).
- **Responded Rate**: `Math.round((responded / applied) * 100)%` where applied & responded include non-SKIP, non-EVALUATED, non-empty statuses.

---

## 2. Component Design (`StatsOverview.tsx`)

### Dynamic Offers Styling
```tsx
const hasOffers = offers > 0;
```
- **Container styling**:
  - `hasOffers`: `bg-surface-card p-6 rounded-xl border border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-400 transition-colors`
  - `!hasOffers`: `bg-surface-card p-6 rounded-xl border border-border-subtle hover:border-primary/50 transition-colors`
- **Text value styling**:
  - `hasOffers`: `text-emerald-400 font-headline-lg text-headline-lg font-bold`
  - `!hasOffers`: `text-text-secondary font-headline-lg text-headline-lg`

### Layout & Responsive Classes
Grid Container:
`className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-5 gap-gutter mb-stack-lg"`

Cards setup:
1. **Total Analyzed**: `className="col-span-1 md:col-span-3 lg:col-span-1 ..."`
2. **Active Processes**: `className="col-span-1 md:col-span-3 lg:col-span-1 ..."`
3. **Interview Stage**: `className="col-span-1 md:col-span-2 lg:col-span-1 ..."`
4. **Offers**: `className="col-span-1 md:col-span-2 lg:col-span-1 ..."`
5. **Responded Rate**: `className="col-span-2 md:col-span-2 lg:col-span-1 ..."`

---

## 3. Testing Plan

### Unit Test (`StatsOverview.test.tsx`)
- Verify rendered output contains `"Interview Stage"` instead of `"Interview Count"`.
- Verify `"Offers"` card is rendered with value `0` when no offers exist, and non-highlighted style.
- Verify `"Offers"` card value and highlighted class/styling when application status is `"Offer"` or `"OFFER"`.
