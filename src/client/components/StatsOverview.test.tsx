import assert from "node:assert";
import test from "node:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { StatsOverview } from "./StatsOverview.js";

test("renders aggregated stats correctly", () => {
  const mockApps = [
    { num: 1, date: "2026-07-14", company: "Company A", role: "Role A", score: "5.0/5", status: "Applied", notes: "Note" },
    { num: 2, date: "2026-07-14", company: "Company B", role: "Role B", score: "4.0/5", status: "SKIP", notes: "Note" },
  ];
  const html = renderToString(React.createElement(StatsOverview, { applications: mockApps }));
  assert.match(html, /Active Processes.*1/);
  assert.match(html, /Interview Count.*0/);
  assert.match(html, /Responded Rate.*0.*%/);
});
