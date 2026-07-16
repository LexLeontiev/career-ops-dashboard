import React from "react";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
}

export function FilterBar({ searchQuery, setSearchQuery, statusFilter, setStatusFilter }: FilterBarProps) {
  return React.createElement(
    "div",
    { className: "filter-bar" },
    React.createElement("input", {
      type: "text",
      className: "search-input",
      placeholder: "Search company, role, or notes...",
      value: searchQuery,
      onChange: (e) => setSearchQuery(e.target.value)
    }),
    React.createElement(
      "select",
      {
        className: "select-input",
        value: statusFilter,
        onChange: (e) => setStatusFilter(e.target.value)
      },
      React.createElement("option", { value: "all" }, "All Statuses"),
      React.createElement("option", { value: "active" }, "Active (Applied / Interview)"),
      React.createElement("option", { value: "closed" }, "Closed (SKIP / Rejected)"),
      React.createElement("option", { value: "evaluated" }, "Evaluated")
    )
  );
}
