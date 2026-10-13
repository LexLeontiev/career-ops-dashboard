import React from "react";
import { ChevronDown, Search } from "lucide-react";
import { useElementOverlayScrollbar } from "../overlay-scrollbar.js";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  counts: Record<string, number>;
}

const filters = [
  { value: "active", label: "Active", alwaysVisible: true },
  { value: "evaluated", label: "Evaluated", alwaysVisible: true },
  { value: "all", label: "All Statuses", alwaysVisible: true },
  { value: "applied", label: "Applied", alwaysVisible: false },
  { value: "interview", label: "Interview", alwaysVisible: false },
  { value: "offer", label: "Offer", alwaysVisible: false },
  { value: "skip", label: "Skip", alwaysVisible: false },
  { value: "rejected", label: "Rejected", alwaysVisible: false },
  { value: "discarded", label: "Discarded", alwaysVisible: false },
];

export function FilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  counts,
}: FilterBarProps) {
  const { onScroll, onThumbPointerDown, scrollbar } = useElementOverlayScrollbar("horizontal");
  const visibleFilters = filters.filter(
    (filter) => filter.alwaysVisible || (counts[filter.value] ?? 0) > 0,
  );

  return (
    <section className="mb-stack-lg space-y-4">
      <div className="relative max-w-md">
        <Search
          aria-hidden="true"
          focusable="false"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          size={20}
        />
        <label className="sr-only" htmlFor="application-search">
          Search applications
        </label>
        <input
          id="application-search"
          className="w-full bg-background-main border border-border-subtle rounded-lg py-3 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          placeholder="Search company, role, or notes..."
          type="text"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Mobile status select dropdown */}
      <div className="relative md:hidden">
        <label htmlFor="status-select" className="sr-only">
          Filter by Status
        </label>
        <select
          id="status-select"
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setStatusFilter(e.target.value);
            e.target.blur();
          }}
          className="w-full appearance-none bg-background-main border border-border-subtle rounded-lg py-3 pl-4 pr-10 text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer"
        >
          {visibleFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {`${filter.label} (${counts[filter.value] ?? 0})`}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          focusable="false"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none"
          size={20}
        />
      </div>

      {/* Desktop status pill buttons */}
      <div className="relative hidden md:block">
        <div
          role="group"
          aria-label="Status filters"
          tabIndex={0}
          onScroll={onScroll}
          className="scrollbar-autohide flex items-center gap-2 overflow-x-auto"
        >
          {visibleFilters.map((filter, index) => (
            <React.Fragment key={filter.value}>
              {index === 3 && <div className="w-px h-8 bg-border-subtle mx-2 flex-shrink-0" />}
              <button
                onClick={() => setStatusFilter(filter.value)}
                className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors flex items-center ${statusFilter === filter.value ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
              >
                {filter.label}{" "}
                <span className="opacity-50 text-xs ml-1.5 font-normal">
                  {counts[filter.value] ?? 0}
                </span>
              </button>
            </React.Fragment>
          ))}
        </div>
        {scrollbar.visible && (
          <span
            aria-hidden="true"
            className="overlay-scrollbar"
            onPointerDown={onThumbPointerDown}
            style={{ left: `${scrollbar.offset}%`, width: `${scrollbar.size}%` }}
          />
        )}
      </div>
    </section>
  );
}
