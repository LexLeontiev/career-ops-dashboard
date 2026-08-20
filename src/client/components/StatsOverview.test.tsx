// @vitest-environment jsdom
import { expect, test } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { StatsOverview } from "./StatsOverview.js";

test("renders aggregated stats correctly including Interview Stage and Offers", () => {
  const mockApps = [
    {
      num: 1,
      date: "2026-07-14",
      company: "Company A",
      role: "Role A",
      score: "5.0/5",
      status: "Applied",
      notes: "Note",
    },
    {
      num: 2,
      date: "2026-07-14",
      company: "Company B",
      role: "Role B",
      score: "4.0/5",
      status: "SKIP",
      notes: "Note",
    },
    {
      num: 3,
      date: "2026-07-14",
      company: "Company C",
      role: "Role C",
      score: "4.5/5",
      status: "Offer",
      notes: "Note",
    },
  ];
  const html = renderToString(React.createElement(StatsOverview, { applications: mockApps }));
  expect(html).toMatch(/Active Processes.*1/);
  expect(html).toMatch(/Interview Stage.*0/);
  expect(html).toMatch(/Offers.*1/);
  expect(html).toMatch(/text-emerald-400/);
  expect(html).toMatch(/Response Rate.*50.*%/);
});

test("renders unhighlighted Offers card when offer count is 0", () => {
  const mockApps = [
    {
      num: 1,
      date: "2026-07-14",
      company: "Company A",
      role: "Role A",
      score: "5.0/5",
      status: "Applied",
      notes: "Note",
    },
  ];
  const html = renderToString(React.createElement(StatsOverview, { applications: mockApps }));
  expect(html).toMatch(/Offers.*0/);
  expect(html).not.toMatch(/text-emerald-400/);
});

test("calculates response rate from submitted applications only", () => {
  const mockApps = [
    {
      num: 1,
      date: "2026-07-14",
      company: "Company A",
      role: "Role A",
      score: "5.0/5",
      status: "Applied",
      notes: "Note",
    },
    {
      num: 2,
      date: "2026-07-14",
      company: "Company B",
      role: "Role B",
      score: "4.0/5",
      status: "Rejected",
      notes: "Note",
    },
    {
      num: 3,
      date: "2026-07-14",
      company: "Company C",
      role: "Role C",
      score: "4.0/5",
      status: "Interview",
      notes: "Note",
    },
    {
      num: 4,
      date: "2026-07-14",
      company: "Company D",
      role: "Role D",
      score: "4.0/5",
      status: "Responded",
      notes: "Note",
    },
    {
      num: 5,
      date: "2026-07-14",
      company: "Company E",
      role: "Role E",
      score: "4.0/5",
      status: "Offer",
      notes: "Note",
    },
    {
      num: 6,
      date: "2026-07-14",
      company: "Company F",
      role: "Role F",
      score: "4.0/5",
      status: "EVALUATED",
      notes: "Note",
    },
    {
      num: 7,
      date: "2026-07-14",
      company: "Company G",
      role: "Role G",
      score: "4.0/5",
      status: "SKIP",
      notes: "Note",
    },
  ];
  const html = renderToString(React.createElement(StatsOverview, { applications: mockApps }));
  expect(html).toMatch(/Total Applications.*7/);
  expect(html).toMatch(/Response Rate.*80.*%/);
});
