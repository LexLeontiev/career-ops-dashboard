import React, { useEffect, useState } from "react";
import { StatsOverview } from "./components/StatsOverview.js";
import { FilterBar } from "./components/FilterBar.js";
import { DataTable, Application } from "./components/DataTable.js";
import { ReportDrawer } from "./components/ReportDrawer.js";
import "./index.css";

export default function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof Application | "">("num");
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
    } else if (statusFilter === "closed") {
      matchesStatus = status === "SKIP" || status === "REJECTED";
    } else if (statusFilter === "evaluated") {
      matchesStatus = status === "EVALUATED";
    }

    return matchesSearch && matchesStatus;
  });

  const sortedApps = [...filteredApps].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];

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
        <aside className="hidden lg:flex flex-col sticky left-0 top-0 pt-stack-lg h-full w-64 border-r border-border-subtle bg-surface-container dark:bg-surface-container">
          <div className="px-6 mb-8">
            <span className="font-headline-sm text-headline-sm font-black text-primary dark:text-primary-fixed-dim">CAREER COMMAND</span>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-bold border-r-2 border-primary bg-surface-hover transition-all duration-200 ease-in-out" href="#">
              <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
              <span className="font-label-md text-label-md">Dashboard</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant font-medium hover:bg-surface-hover hover:text-on-surface transition-all duration-200 ease-in-out" href="#">
              <span className="material-symbols-outlined" data-icon="work_history">work_history</span>
              <span className="font-label-md text-label-md">Applications</span>
            </a>
          </nav>
        </aside>

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

      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-surface-container-low dark:bg-surface-container-low border-t border-border-subtle dark:border-border-subtle shadow-lg">
        <a className="flex flex-col items-center justify-center bg-primary-container dark:bg-primary-container text-on-primary-container dark:text-on-primary-container rounded-xl py-1 px-4 active:scale-95 transition-transform duration-150" href="#">
          <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
          <span className="font-label-sm text-label-sm">Dash</span>
        </a>
        <a className="flex flex-col items-center justify-center text-on-surface-variant dark:text-on-surface-variant py-1 px-4 hover:bg-surface-hover active:scale-95 transition-transform duration-150" href="#">
          <span className="material-symbols-outlined" data-icon="work_history">work_history</span>
          <span className="font-label-sm text-label-sm">Apps</span>
        </a>
      </nav>

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
