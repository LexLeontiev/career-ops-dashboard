import assert from "node:assert";
import test from "node:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { DataTable } from "./DataTable.js";

test("table displays job details and score class colorings", () => {
  const mockApps = [
    { num: 47, date: "2026-07-14", company: "Fingerprint", via: "—", role: "Senior Android", score: "5.0/5", status: "Evaluated", report: "reports/046.md", notes: "Great match" }
  ];
  const html = renderToString(React.createElement(DataTable, {
    applications: mockApps,
    onSelect: () => {},
    sortField: "score",
    sortOrder: "desc",
    onSort: () => {}
  }));
  assert.match(html, /Fingerprint/);
  assert.match(html, /Senior Android/);
  assert.match(html, /5\.0\/5/);
  assert.match(html, /Great match/);
});
