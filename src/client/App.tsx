import React, { useEffect, useState } from "react";
import { StatsOverview } from "./components/StatsOverview.js";
import { FilterBar } from "./components/FilterBar.js";
import { DataTable, Application } from "./components/DataTable.js";
import { ReportDrawer } from "./components/ReportDrawer.js";
export default function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof Application | "">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/applications");
        if (!res.ok) throw new Error("Failed to load applications");
        const data = await res.json();
        setApplications(data);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSort = (field: keyof Application) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const counts = {
    all: 0,
    active: 0,
    closed: 0,
    applied: 0,
    interview: 0,
    evaluated: 0,
    skip: 0,
    rejected: 0,
  };

  applications.forEach((app) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      app.company.toLowerCase().includes(term) ||
      app.role.toLowerCase().includes(term) ||
      app.notes.toLowerCase().includes(term);

    if (!matchesSearch) return;

    counts.all++;
    const status = (app.status || "").toUpperCase();
    
    if (status === "APPLIED" || status === "INTERVIEW" || status === "RESPONDED") counts.active++;
    if (status === "SKIP" || status === "REJECTED") counts.closed++;
    
    if (status === "APPLIED") counts.applied++;
    if (status === "INTERVIEW") counts.interview++;
    if (status === "EVALUATED") counts.evaluated++;
    if (status === "SKIP") counts.skip++;
    if (status === "REJECTED") counts.rejected++;
  });

  const filteredApps = applications.filter((app) => {
    // Search query match
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      app.company.toLowerCase().includes(term) ||
      app.role.toLowerCase().includes(term) ||
      app.notes.toLowerCase().includes(term);

    // Status filter match
    const status = (app.status || "").toUpperCase();
    let matchesStatus = true;
    if (statusFilter === "active") {
      matchesStatus = status === "APPLIED" || status === "INTERVIEW" || status === "RESPONDED";
    } else if (statusFilter === "interview") {
      matchesStatus = status === "INTERVIEW";
    } else if (statusFilter === "closed") {
      matchesStatus = status === "SKIP" || status === "REJECTED";
    } else if (statusFilter === "evaluated") {
      matchesStatus = status === "EVALUATED";
    } else if (statusFilter === "skip") {
      matchesStatus = status === "SKIP";
    } else if (statusFilter === "rejected") {
      matchesStatus = status === "REJECTED";
    } else if (statusFilter === "applied") {
      matchesStatus = status === "APPLIED";
    }

    return matchesSearch && matchesStatus;
  });

  const sortedApps = [...filteredApps].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (sortField === "score") {
      const aScore = parseFloat(String(aVal));
      const bScore = parseFloat(String(bVal));
      const aIsNaN = isNaN(aScore);
      const bIsNaN = isNaN(bScore);
      
      if (aIsNaN && bIsNaN) return 0;
      if (aIsNaN) return 1;
      if (bIsNaN) return -1;
      
      return sortOrder === "asc" ? aScore - bScore : bScore - aScore;
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }
    return sortOrder === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  return (
    <div className="font-body-md text-on-surface overflow-x-hidden selection:bg-primary-container">
      <header className="bg-surface-container-lowest dark:bg-surface-container-lowest w-full top-0 sticky z-50 border-b border-border-subtle dark:border-border-subtle">
        <div className="flex justify-between items-center w-full px-margin-desktop py-stack-md max-w-container-max mx-auto">
          <div className="flex items-center gap-stack-md cursor-pointer active:opacity-80 transition-all">
            <span className="material-symbols-outlined text-primary dark:text-primary-fixed-dim font-headline-md text-headline-md" data-icon="terminal">terminal</span>
            <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">Career Ops</h1>
          </div>

        </div>
      </header>

      <div className="flex max-w-container-max mx-auto min-h-screen">


        <main className="flex-1 w-full px-margin-mobile md:px-margin-desktop py-stack-lg pb-24 lg:pb-stack-lg">
          {loading && <p>Loading data...</p>}
          {error && <div style={{ color: "var(--color-error)" }}>{error}</div>}
          
          {!loading && !error && (
            <>
              <StatsOverview applications={applications} />
              <FilterBar 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                counts={counts}
              />
              <DataTable 
                applications={sortedApps}
                onSelect={setSelectedApp}
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            </>
          )}
        </main>
      </div>



      {selectedApp && (
        <ReportDrawer
          reportPath={selectedApp.report}
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          company={selectedApp.company}
          role={selectedApp.role}
        />
      )}
    </div>
  );
}
