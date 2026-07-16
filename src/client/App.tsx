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

  return React.createElement(
    "div",
    { className: "dashboard-container" },
    React.createElement(
      "header",
      null,
      React.createElement("h1", { className: "title" }, "Career Ops Dashboard")
    ),
    loading && React.createElement("p", null, "Loading data..."),
    error && React.createElement("div", { style: { color: "var(--color-error)" } }, error),
    !loading && !error && React.createElement(
      React.Fragment,
      null,
      React.createElement(StatsOverview, { applications }),
      React.createElement(FilterBar, {
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter
      }),
      React.createElement(DataTable, {
        applications: sortedApps,
        onSelect: setSelectedApp,
        sortField,
        sortOrder,
        onSort: handleSort
      })
    ),
    selectedApp && React.createElement(ReportDrawer, {
      reportPath: selectedApp.report,
      isOpen: !!selectedApp,
      onClose: () => setSelectedApp(null),
      company: selectedApp.company,
      role: selectedApp.role
    })
  );
}
