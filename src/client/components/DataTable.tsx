import React from "react";

export interface Application {
  num: number;
  date: string;
  company: string;
  via: string;
  role: string;
  score: string;
  status: string;
  report: string;
  notes: string;
}

interface DataTableProps {
  applications: Application[];
  onSelect: (app: Application) => void;
  sortField: keyof Application | "";
  sortOrder: "asc" | "desc";
  onSort: (field: keyof Application) => void;
}

export function DataTable({ applications, onSelect, sortField, sortOrder, onSort }: DataTableProps) {
  const getScoreClass = (scoreStr: string) => {
    const score = parseFloat(scoreStr);
    if (isNaN(score)) return "score-low";
    if (score >= 4.5) return "score-high";
    if (score >= 3.5) return "score-med";
    return "score-low";
  };

  const getStatusClass = (statusStr: string) => {
    const status = (statusStr || "").toUpperCase();
    if (status === "APPLIED" || status === "INTERVIEW" || status === "RESPONDED") return "status-active";
    if (status === "SKIP" || status === "REJECTED") return "status-closed";
    return "status-eval";
  };

  const renderSortIndicator = (field: keyof Application) => {
    if (sortField !== field) return "";
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  return React.createElement(
    "div",
    { className: "table-container" },
    React.createElement(
      "table",
      null,
      React.createElement(
        "thead",
        null,
        React.createElement(
          "tr",
          null,
          React.createElement("th", { onClick: () => onSort("num") }, `num${renderSortIndicator("num")}`),
          React.createElement("th", { onClick: () => onSort("date") }, `Date${renderSortIndicator("date")}`),
          React.createElement("th", { onClick: () => onSort("company") }, `Company${renderSortIndicator("company")}`),
          React.createElement("th", { onClick: () => onSort("role") }, `Role${renderSortIndicator("role")}`),
          React.createElement("th", { onClick: () => onSort("score") }, `Score${renderSortIndicator("score")}`),
          React.createElement("th", { onClick: () => onSort("status") }, `Status${renderSortIndicator("status")}`),
          React.createElement("th", null, "Comment / Reason")
        )
      ),
      React.createElement(
        "tbody",
        null,
        applications.map((app) =>
          React.createElement(
            "tr",
            { key: app.num, onClick: () => onSelect(app) },
            React.createElement("td", null, app.num),
            React.createElement("td", null, app.date),
            React.createElement("td", { style: { fontWeight: "bold" } }, app.company),
            React.createElement("td", null, app.role),
            React.createElement(
              "td",
              null,
              React.createElement("span", { className: `badge-score ${getScoreClass(app.score)}` }, app.score)
            ),
            React.createElement(
              "td",
              null,
              React.createElement("span", { className: `badge-status ${getStatusClass(app.status)}` }, app.status)
            ),
            React.createElement("td", { style: { color: "var(--text-muted)", fontSize: "13px" } }, app.notes)
          )
        )
      )
    )
  );
}
