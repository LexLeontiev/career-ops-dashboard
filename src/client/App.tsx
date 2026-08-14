import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Moon, Sun, Terminal } from "lucide-react";
import type { Application } from "../shared/application.js";
import { fetchApplications } from "./api.js";
import { StatsOverview } from "./components/StatsOverview.js";
import { FilterBar } from "./components/FilterBar.js";
import { DataTable } from "./components/DataTable.js";

const ReportDrawer = React.lazy(async () => {
  const module = await import("./components/ReportDrawer.js");
  return { default: module.ReportDrawer };
});

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "career_ops_theme";

export default function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [sortField, setSortField] = useState<keyof Application | "">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  const [isBlurred, setIsBlurred] = useState<boolean>(() => {
    try {
      return localStorage.getItem("career_ops_blur_mode") === "true";
    } catch {
      return false;
    }
  });

  const toggleBlur = () => {
    setIsBlurred((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("career_ops_blur_mode", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {}
      return nextTheme;
    });
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchApplications(controller.signal)
      .then(setApplications)
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Failed to load applications");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
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
    applied: 0,
    interview: 0,
    evaluated: 0,
    skip: 0,
    rejected: 0,
    discarded: 0,
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
    
    if (status === "APPLIED") counts.applied++;
    if (status === "INTERVIEW") counts.interview++;
    if (status === "EVALUATED") counts.evaluated++;
    if (status === "SKIP") counts.skip++;
    if (status === "REJECTED") counts.rejected++;
    if (status === "DISCARDED") counts.discarded++;
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
    } else if (statusFilter === "evaluated") {
      matchesStatus = status === "EVALUATED";
    } else if (statusFilter === "skip") {
      matchesStatus = status === "SKIP";
    } else if (statusFilter === "rejected") {
      matchesStatus = status === "REJECTED";
    } else if (statusFilter === "applied") {
      matchesStatus = status === "APPLIED";
    } else if (statusFilter === "discarded") {
      matchesStatus = status === "DISCARDED";
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
      <header className="bg-surface-container-lowest w-full top-0 sticky z-50 border-b border-border-subtle">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-stack-md max-w-container-max mx-auto">
          <div className="flex items-center gap-stack-md cursor-pointer active:opacity-80 transition-all">
            <Terminal aria-hidden="true" focusable="false" className="text-primary" size={28} />
            <div className="flex flex-col justify-center">
              <h1 className="font-headline-md text-headline-md font-bold text-primary leading-none">Career Ops</h1>
              <span className="text-[10px] font-label-sm font-semibold tracking-widest uppercase text-on-surface-variant/80 mt-1">Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleBlur}
              title={isBlurred ? "Disable privacy mode" : "Enable privacy mode"}
              aria-label={isBlurred ? "Disable privacy mode" : "Enable privacy mode"}
              aria-pressed={isBlurred}
              className="p-2 sm:px-3 rounded-lg bg-surface-container-high hover:bg-surface-hover text-on-surface-variant transition-colors flex items-center gap-2 text-label-sm font-label-sm cursor-pointer"
            >
              {isBlurred
                ? <EyeOff aria-hidden="true" focusable="false" size={20} />
                : <Eye aria-hidden="true" focusable="false" size={20} />}
              <span className="hidden sm:inline">{isBlurred ? "Privacy On" : "Privacy Off"}</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              aria-pressed={theme === "dark"}
              className="p-2 sm:px-3 rounded-lg bg-surface-container-high hover:bg-surface-hover text-on-surface-variant transition-colors flex items-center gap-2 text-label-sm font-label-sm cursor-pointer"
            >
              {theme === "dark"
                ? <Moon aria-hidden="true" focusable="false" size={20} />
                : <Sun aria-hidden="true" focusable="false" size={20} />}
              <span className="hidden sm:inline">{theme === "dark" ? "Dark" : "Light"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex max-w-container-max mx-auto min-h-screen">


        <main className="flex-1 w-full px-margin-mobile md:px-margin-desktop py-stack-lg pb-24 lg:pb-stack-lg">
          {loading && <p role="status">Loading applications…</p>}
          {error && <div role="alert" style={{ color: "var(--color-error)" }}>{error}</div>}
          
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
                isBlurred={isBlurred}
              />
            </>
          )}
        </main>
      </div>




      {selectedApp && (
        <React.Suspense fallback={null}>
          <ReportDrawer
            reportPath={selectedApp.report}
            isOpen={!!selectedApp}
            onClose={() => setSelectedApp(null)}
            company={selectedApp.company}
            role={selectedApp.role}
          />
        </React.Suspense>
      )}
    </div>
  );
}
