import assert from "node:assert";
import test from "node:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { StatsOverview } from "./StatsOverview.js";

test("renders aggregated stats correctly including Interview Stage and Offers", () => {
  const mockApps = [
    { num: 1, date: "2026-07-14", company: "Company A", role: "Role A", score: "5.0/5", status: "Applied", notes: "Note" },
    { num: 2, date: "2026-07-14", company: "Company B", role: "Role B", score: "4.0/5", status: "SKIP", notes: "Note" },
    { num: 3, date: "2026-07-14", company: "Company C", role: "Role C", score: "4.5/5", status: "Offer", notes: "Note" },
  ];
  const html = renderToString(React.createElement(StatsOverview, { applications: mockApps }));
  assert.match(html, /Active Processes.*1/);
  assert.match(html, /Interview Stage.*0/);
  assert.match(html, /Offers.*1/);
  assert.match(html, /text-emerald-400/);
  assert.match(html, /Responded Rate.*0.*%/);
});

test("renders unhighlighted Offers card when offer count is 0", () => {
  const mockApps = [
    { num: 1, date: "2026-07-14", company: "Company A", role: "Role A", score: "5.0/5", status: "Applied", notes: "Note" },
  ];
  const html = renderToString(React.createElement(StatsOverview, { applications: mockApps }));
  assert.match(html, /Offers.*0/);
  assert.doesNotMatch(html, /text-emerald-400/);
});

test("calculates Responded Rate correctly for processed/response statuses (Rejected, Interview, Discarded, Offer)", () => {
  const mockApps = [
    { num: 1, date: "2026-07-14", company: "Company A", role: "Role A", score: "5.0/5", status: "Applied", notes: "Note" },
    { num: 2, date: "2026-07-14", company: "Company B", role: "Role B", score: "4.0/5", status: "Rejected", notes: "Note" },
    { num: 3, date: "2026-07-14", company: "Company C", role: "Role C", score: "4.0/5", status: "Interview", notes: "Note" },
    { num: 4, date: "2026-07-14", company: "Company D", role: "Role D", score: "4.0/5", status: "EVALUATED", notes: "Note" },
  ];
  const html = renderToString(React.createElement(StatsOverview, { applications: mockApps }));
  assert.match(html, /Responded Rate.*67.*%/);
});


