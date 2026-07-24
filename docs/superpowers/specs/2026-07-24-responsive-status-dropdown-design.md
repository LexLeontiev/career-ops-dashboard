# Responsive Status Filter Dropdown Design

## Overview
Enhance the `FilterBar` component by rendering status filters as a styled dropdown menu (`<select>`) on mobile/small screens (`< 768px`), while preserving the horizontal pill button row on desktop/tablet screens (`≥ 768px`).

---

## 1. Responsive UI Structure

### Mobile View (`< md`)
- A `<select>` element displayed below or alongside the search input (`block md:hidden`).
- Custom styling matching existing inputs (`w-full bg-background-main border border-border-subtle rounded-lg py-3 px-4 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface`).
- Option list:
  1. `All Statuses (${counts.all})` -> `value="all"`
  2. `Active (${counts.active})` -> `value="active"`
  3. `Evaluated (${counts.evaluated})` -> `value="evaluated"`
  4. `Applied (${counts.applied})` -> `value="applied"`
  5. `Interview (${counts.interview})` -> `value="interview"`
  6. `Skip (${counts.skip})` -> `value="skip"`
  7. `Rejected (${counts.rejected})` -> `value="rejected"`
  8. `Discarded (${counts.discarded})` -> `value="discarded"`

### Desktop / Tablet View (`≥ md`)
- The existing horizontal button pills wrapped in `hidden md:flex`.

---

## 2. Component Design (`FilterBar.tsx`)

```tsx
<div className="md:hidden">
  <label htmlFor="status-select" className="sr-only">Filter by Status</label>
  <select
    id="status-select"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="w-full bg-background-main border border-border-subtle rounded-lg py-3 px-4 text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer"
  >
    <option value="all">All Statuses ({counts.all ?? 0})</option>
    <option value="active">Active ({counts.active ?? 0})</option>
    <option value="evaluated">Evaluated ({counts.evaluated ?? 0})</option>
    <option value="applied">Applied ({counts.applied ?? 0})</option>
    <option value="interview">Interview ({counts.interview ?? 0})</option>
    <option value="skip">Skip ({counts.skip ?? 0})</option>
    <option value="rejected">Rejected ({counts.rejected ?? 0})</option>
    <option value="discarded">Discarded ({counts.discarded ?? 0})</option>
  </select>
</div>

<div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
  {/* Existing pill buttons */}
</div>
```

---

## 3. Testing Plan

### Component Test
- Add unit test verifying that `status-select` dropdown element is rendered in `FilterBar` with options and correct count values.
- Verify changing option triggers `setStatusFilter`.
