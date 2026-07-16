import React from "react";

interface AppData {
  score: string;
  status: string;
}

export function StatsOverview({ applications }: { applications: AppData[] }) {
  const total = applications.length;
  let active = 0;
  let closed = 0;
  let scoreSum = 0;
  let scoreCount = 0;

  for (const app of applications) {
    const status = (app.status || "").toUpperCase();
    if (status === "APPLIED" || status === "INTERVIEW" || status === "RESPONDED") {
      active++;
    } else if (status === "SKIP" || status === "REJECTED") {
      closed++;
    }

    const val = parseFloat(app.score);
    if (!isNaN(val)) {
      scoreSum += val;
      scoreCount++;
    }
  }

  const avgScore = scoreCount > 0 ? (scoreSum / scoreCount).toFixed(2) : "N/A";

  return React.createElement(
    "div",
    { className: "stats-grid" },
    React.createElement(
      "div",
      { className: "stat-card" },
      React.createElement("div", { className: "stat-label" }, "Total Analyzed"),
      React.createElement("div", { className: "stat-value" }, total)
    ),
    React.createElement(
      "div",
      { className: "stat-card" },
      React.createElement("div", { className: "stat-label" }, "Active Processes"),
      React.createElement("div", { className: "stat-value" }, active)
    ),
    React.createElement(
      "div",
      { className: "stat-card" },
      React.createElement("div", { className: "stat-label" }, "Closed/Skipped"),
      React.createElement("div", { className: "stat-value" }, closed)
    ),
    React.createElement(
      "div",
      { className: "stat-card" },
      React.createElement("div", { className: "stat-label" }, "Avg Match Score"),
      React.createElement("div", { className: "stat-value" }, avgScore)
    )
  );
}
