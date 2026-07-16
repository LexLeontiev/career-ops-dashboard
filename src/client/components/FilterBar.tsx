import React from "react";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
}

export function FilterBar({ searchQuery, setSearchQuery, statusFilter, setStatusFilter }: FilterBarProps) {
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
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button 
          onClick={() => setStatusFilter("all")}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors ${statusFilter === "all" ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
        >
          All Statuses
        </button>
        <button 
          onClick={() => setStatusFilter("active")}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors ${statusFilter === "active" ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
        >
          Active
        </button>
        <button 
          onClick={() => setStatusFilter("closed")}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors ${statusFilter === "closed" ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
        >
          Closed
        </button>

        <div className="w-px h-8 bg-border-subtle mx-2 flex-shrink-0" />

        <button 
          onClick={() => setStatusFilter("applied")}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors ${statusFilter === "applied" ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
        >
          Applied
        </button>
        <button 
          onClick={() => setStatusFilter("interview")}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors ${statusFilter === "interview" ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
        >
          Interview
        </button>
        <button 
          onClick={() => setStatusFilter("evaluated")}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors ${statusFilter === "evaluated" ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
        >
          Evaluated
        </button>
        <button 
          onClick={() => setStatusFilter("skip")}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors ${statusFilter === "skip" ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
        >
          Skip
        </button>
        <button 
          onClick={() => setStatusFilter("rejected")}
          className={`flex-shrink-0 px-5 py-2 rounded-full font-label-md text-label-md transition-colors ${statusFilter === "rejected" ? "bg-primary text-on-primary-container" : "border border-border-subtle text-on-surface-variant hover:bg-surface-hover"}`}
        >
          Rejected
        </button>
      </div>
    </section>
  );
}
