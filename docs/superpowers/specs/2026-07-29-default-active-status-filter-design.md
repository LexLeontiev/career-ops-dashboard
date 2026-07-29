# Default Active Status Filter & Reordered Options Design

## Overview
Update the Career Ops Dashboard to default to filtering by **Active** positions on initial page load, and reorder status filter controls across both desktop pills and mobile dropdown so that **Active** and **Evaluated** appear first, followed by **All Statuses**, with all remaining status filters preserved after the visual separator.

---

## 1. Requirements

1. **Default Status Filter State**: Change initial `statusFilter` state in `App.tsx` from `"all"` to `"active"`.
2. **FilterBar Controls Reordering**:
   - Primary group (before divider):
     1. **Active** (`active`)
     2. **Evaluated** (`evaluated`)
     3. **All Statuses** (`all`)
   - Visual Separator (`<div className="w-px h-8 bg-border-subtle mx-2 flex-shrink-0" />`)
   - Secondary group (after divider, unchanged order):
     4. **Applied** (`applied`)
     5. **Interview** (`interview`)
     6. **Skip** (`skip`)
     7. **Rejected** (`rejected`)
     8. **Discarded** (`discarded`)
3. **Mobile Dropdown (`<select>`) Order**: Update option order in `FilterBar.tsx` to match the exact same logical order: Active, Evaluated, All Statuses, Applied, Interview, Skip, Rejected, Discarded.

---

## 2. Component Design Updates

### `src/client/App.tsx`
Change line 12:
```tsx
const [statusFilter, setStatusFilter] = useState("active");
```

### `src/client/components/FilterBar.tsx`
Update mobile dropdown `<select>` options and desktop pill buttons order:

```tsx
{/* Mobile status select dropdown */}
<select id="status-select" value={statusFilter} ...>
  <option value="active">{`Active (${counts.active ?? 0})`}</option>
  <option value="evaluated">{`Evaluated (${counts.evaluated ?? 0})`}</option>
  <option value="all">{`All Statuses (${counts.all ?? 0})`}</option>
  <option value="applied">{`Applied (${counts.applied ?? 0})`}</option>
  <option value="interview">{`Interview (${counts.interview ?? 0})`}</option>
  <option value="skip">{`Skip (${counts.skip ?? 0})`}</option>
  <option value="rejected">{`Rejected (${counts.rejected ?? 0})`}</option>
  <option value="discarded">{`Discarded (${counts.discarded ?? 0})`}</option>
</select>

{/* Desktop status pill buttons */}
<div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
  <button onClick={() => setStatusFilter("active")} ...>
    Active <span className="opacity-50 text-xs ml-1.5 font-normal">{counts.active}</span>
  </button>
  <button onClick={() => setStatusFilter("evaluated")} ...>
    Evaluated <span className="opacity-50 text-xs ml-1.5 font-normal">{counts.evaluated}</span>
  </button>
  <button onClick={() => setStatusFilter("all")} ...>
    All Statuses <span className="opacity-50 text-xs ml-1.5 font-normal">{counts.all}</span>
  </button>

  <div className="w-px h-8 bg-border-subtle mx-2 flex-shrink-0" />

  <button onClick={() => setStatusFilter("applied")} ...>Applied ...</button>
  <button onClick={() => setStatusFilter("interview")} ...>Interview ...</button>
  <button onClick={() => setStatusFilter("skip")} ...>Skip ...</button>
  <button onClick={() => setStatusFilter("rejected")} ...>Rejected ...</button>
  <button onClick={() => setStatusFilter("discarded")} ...>Discarded ...</button>
</div>
```

---

## 3. Testing & Verification

- Run `npm test` to ensure existing unit tests pass.
- Update/add test assertions in `src/client/components/FilterBar.test.tsx` to verify option rendering order for `Active`, `Evaluated`, and `All Statuses`.
