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
  assert.match(html, /5\.0/);
  assert.match(html, /Great match/);
});

test("table renders fixed-size privacy noise when isBlurred is true", () => {
  const mockApps = [
    { num: 47, date: "2026-07-14", company: "Fingerprint", via: "—", role: "Senior Android", score: "5.0/5", status: "Evaluated", report: "reports/046.md", notes: "Great match" }
  ];
  const html = renderToString(React.createElement(DataTable, {
    applications: mockApps,
    onSelect: () => {},
    sortField: "score",
    sortOrder: "desc",
    onSort: () => {},
    isBlurred: true
  }));
  assert.match(html, /privacy-noise--score privacy-noise--active/);
  assert.match(html, /privacy-noise--company privacy-noise--active/);
  assert.match(html, /privacy-noise--role privacy-noise--active/);
  assert.match(html, /privacy-noise--date privacy-noise--active/);
  assert.match(html, /privacy-noise--table-notes privacy-noise--active/);
  assert.match(html, /data-private="true"/);
  assert.match(html, /aria-label="Reveal score"/);
  assert.match(html, /aria-label="Reveal company"/);
  assert.match(html, /aria-label="Reveal last interaction date"/);
  assert.doesNotMatch(html, /blur-\[4px\]/);
  assert.doesNotMatch(html, /title="Great match"/);
});

test("table keeps the same privacy wrappers without noise when isBlurred is false", () => {
  const mockApps = [
    { num: 47, date: "2026-07-14", company: "Fingerprint", via: "—", role: "Senior Android", score: "5.0/5", status: "Evaluated", report: "reports/046.md", notes: "Great match" }
  ];
  const html = renderToString(React.createElement(DataTable, {
    applications: mockApps,
    onSelect: () => {},
    sortField: "score",
    sortOrder: "desc",
    onSort: () => {},
    isBlurred: false
  }));
  assert.match(html, /privacy-noise privacy-noise--score/);
  assert.match(html, /privacy-noise privacy-noise--company/);
  assert.match(html, /privacy-noise privacy-noise--role/);
  assert.match(html, /privacy-noise privacy-noise--date/);
  assert.match(html, /privacy-noise privacy-noise--table-notes/);
  assert.doesNotMatch(html, /privacy-noise--active/);
  assert.doesNotMatch(html, /data-private="true"/);
  assert.doesNotMatch(html, /blur-\[4px\]/);
  assert.match(html, /title="Great match"/);
});
