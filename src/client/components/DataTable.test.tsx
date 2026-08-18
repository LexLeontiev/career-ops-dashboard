// @vitest-environment jsdom
import { expect, test } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { DataTable } from "./DataTable.js";

test("table displays job details and score class colorings", () => {
  const mockApps = [
    {
      num: 47,
      date: "2026-07-14",
      company: "Quasar Works",
      via: "Synthetic referral",
      role: "Orbital Systems Engineer",
      score: "5.0/5",
      status: "Evaluated",
      pdf: "quasar-fixture.pdf",
      report: "reports/047-quasar-fixture.md",
      notes: "Fixture-only match note",
    },
  ];
  const html = renderToString(
    React.createElement(DataTable, {
      applications: mockApps,
      onSelect: () => {},
      sortField: "score",
      sortOrder: "desc",
      onSort: () => {},
    }),
  );
  expect(html).toMatch(/Quasar Works/);
  expect(html).toMatch(/Orbital Systems Engineer/);
  expect(html).toMatch(/5\.0/);
  expect(html).toMatch(/Fixture-only match note/);
});

test("table renders fixed-size privacy noise when isBlurred is true", () => {
  const mockApps = [
    {
      num: 47,
      date: "2026-07-14",
      company: "Quasar Works",
      via: "Synthetic referral",
      role: "Orbital Systems Engineer",
      score: "5.0/5",
      status: "Evaluated",
      pdf: "quasar-fixture.pdf",
      report: "reports/047-quasar-fixture.md",
      notes: "Fixture-only match note",
    },
  ];
  const html = renderToString(
    React.createElement(DataTable, {
      applications: mockApps,
      onSelect: () => {},
      sortField: "score",
      sortOrder: "desc",
      onSort: () => {},
      isBlurred: true,
    }),
  );
  expect(html).toMatch(/privacy-noise--score privacy-noise--active/);
  expect(html).toMatch(/privacy-noise--company privacy-noise--active/);
  expect(html).toMatch(/privacy-noise--role privacy-noise--active/);
  expect(html).toMatch(/privacy-noise--date privacy-noise--active/);
  expect(html).toMatch(/privacy-noise--table-notes privacy-noise--active/);
  expect(html).toMatch(/data-private="true"/);
  expect(html).toMatch(/aria-label="Reveal score"/);
  expect(html).toMatch(/aria-label="Reveal company"/);
  expect(html).toMatch(/aria-label="Reveal last interaction date"/);
  expect(html).not.toMatch(/blur-\[4px\]/);
  expect(html).not.toMatch(/title="Fixture-only match note"/);
});

test("table keeps the same privacy wrappers without noise when isBlurred is false", () => {
  const mockApps = [
    {
      num: 47,
      date: "2026-07-14",
      company: "Quasar Works",
      via: "Synthetic referral",
      role: "Orbital Systems Engineer",
      score: "5.0/5",
      status: "Evaluated",
      pdf: "quasar-fixture.pdf",
      report: "reports/047-quasar-fixture.md",
      notes: "Fixture-only match note",
    },
  ];
  const html = renderToString(
    React.createElement(DataTable, {
      applications: mockApps,
      onSelect: () => {},
      sortField: "score",
      sortOrder: "desc",
      onSort: () => {},
      isBlurred: false,
    }),
  );
  expect(html).toMatch(/privacy-noise privacy-noise--score/);
  expect(html).toMatch(/privacy-noise privacy-noise--company/);
  expect(html).toMatch(/privacy-noise privacy-noise--role/);
  expect(html).toMatch(/privacy-noise privacy-noise--date/);
  expect(html).toMatch(/privacy-noise privacy-noise--table-notes/);
  expect(html).not.toMatch(/privacy-noise--active/);
  expect(html).not.toMatch(/data-private="true"/);
  expect(html).not.toMatch(/blur-\[4px\]/);
  expect(html).toMatch(/title="Fixture-only match note"/);
});
