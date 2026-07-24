import React from "react";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  counts: Record<string, number>;
}

export function FilterBar({ searchQuery, setSearchQuery, statusFilter, setStatusFilter, counts }: FilterBarProps) {
  return (
    <section className="mb-stack-lg space-y-4">
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" data-icon="search">search</span>
        <input 
          className="w-full bg-background-main border border-border-subtle rounded-lg py-3 pl-10 pr-4 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all" 
          placeholder="Search company, role, or notes..." 
          type="text"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Mobile status select dropdown */}
      <div className="md:hidden">
        <label htmlFor="status-select" className="sr-only">Filter by Status</label>
        <select
          id="status-select"
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
          className="w-full bg-background-main border border-border-subtle rounded-lg py-3 px-4 text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer"
        >
          <option value="all">{`All Statuses (${counts.all ?? 0})`}</option>
          <option value="active">{`Active (${counts.active ?? 0})`}</option>
          <option value="evaluated">{`Evaluated (${counts.evaluated ?? 0})`}</option>
          <option value="applied">{`Applied (${counts.applied ?? 0})`}</option>
          <option value="interview">{`Interview (${counts.interview ?? 0})`}</option>
          <option value="skip">{`Skip (${counts.skip ?? 0})`}</option>
          <option value="rejected">{`Rejected (${counts.rejected ?? 0})`}</option>
          <option value="discarded">{`Discarded (${counts.discarded ?? 0})`}</option>
        </select>
      </div>

      {/* Desktop status pill buttons */}
      <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button 
          onClick={() => setStatusFilter("all")}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors flex items-center ${statusFilter === "all" ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
        >
          All Statuses <span className="opacity-50 text-xs ml-1.5 font-normal">{counts.all}</span>
        </button>
        <button 
          onClick={() => setStatusFilter("active")}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors flex items-center ${statusFilter === "active" ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
        >
          Active <span className="opacity-50 text-xs ml-1.5 font-normal">{counts.active}</span>
        </button>
        <button 
          onClick={() => setStatusFilter("evaluated")}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors flex items-center ${statusFilter === "evaluated" ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
        >
          Evaluated <span className="opacity-50 text-xs ml-1.5 font-normal">{counts.evaluated}</span>
        </button>

        <div className="w-px h-8 bg-border-subtle mx-2 flex-shrink-0" />

        <button 
          onClick={() => setStatusFilter("applied")}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors flex items-center ${statusFilter === "applied" ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
        >
          Applied <span className="opacity-50 text-xs ml-1.5 font-normal">{counts.applied}</span>
        </button>
        <button 
          onClick={() => setStatusFilter("interview")}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors flex items-center ${statusFilter === "interview" ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
        >
          Interview <span className="opacity-50 text-xs ml-1.5 font-normal">{counts.interview}</span>
        </button>

        <button 
          onClick={() => setStatusFilter("skip")}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors flex items-center ${statusFilter === "skip" ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
        >
          Skip <span className="opacity-50 text-xs ml-1.5 font-normal">{counts.skip}</span>
        </button>
        <button 
          onClick={() => setStatusFilter("rejected")}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors flex items-center ${statusFilter === "rejected" ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
        >
          Rejected <span className="opacity-50 text-xs ml-1.5 font-normal">{counts.rejected}</span>
        </button>
        <button 
          onClick={() => setStatusFilter("discarded")}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors flex items-center ${statusFilter === "discarded" ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
        >
          Discarded <span className="opacity-50 text-xs ml-1.5 font-normal">{counts.discarded}</span>
        </button>
      </div>
    </section>
  );
}

