// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import type { Application } from "../../shared/application.js";
import { DataTable } from "./DataTable.js";

afterEach(cleanup);

const application: Application = {
  num: 1,
  date: "2026-08-01",
  company: "Acme Labs",
  via: "Direct",
  role: "Platform Engineer",
  score: "4.5/5",
  status: "INTERVIEW",
  pdf: "acme.pdf",
  report: "reports/acme.md",
  notes: "Synthetic fixture",
};

test("exposes sortable headers and report actions to keyboard users", async () => {
  const user = userEvent.setup();
  const onSort = vi.fn();

  render(
    <DataTable
      applications={[application]}
      onSelect={vi.fn()}
      sortField="score"
      sortOrder="desc"
      onSort={onSort}
    />,
  );

  const scoreHeader = screen.getByRole("columnheader", { name: /score/i });
  expect(scoreHeader).toHaveAttribute("aria-sort", "descending");

  const scoreSortButton = within(scoreHeader).getByRole("button", { name: /sort by score/i });
  await user.click(scoreSortButton);
  expect(onSort).toHaveBeenLastCalledWith("score");

  scoreSortButton.focus();
  await user.keyboard("{Enter}");
  expect(onSort).toHaveBeenCalledTimes(2);
  expect(onSort).toHaveBeenLastCalledWith("score");

  expect(screen.getByRole("button", { name: /open report for acme labs/i })).toBeInTheDocument();
});

test("disables the report action when an application has no report", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();

  render(
    <DataTable
      applications={[{ ...application, report: "" }]}
      onSelect={onSelect}
      sortField="score"
      sortOrder="desc"
      onSort={vi.fn()}
    />,
  );

  const reportButton = screen.getByRole("button", {
    name: /report unavailable for acme labs/i,
  });
  expect(reportButton).toBeDisabled();

  await user.click(reportButton);
  expect(onSelect).not.toHaveBeenCalled();
});

test("keeps an invalid ISO date literal", () => {
  render(
    <DataTable
      applications={[{ ...application, date: "2026-02-30" }]}
      onSelect={vi.fn()}
      sortField="score"
      sortOrder="desc"
      onSort={vi.fn()}
    />,
  );

  expect(screen.getByRole("row", { name: /acme labs/i })).toHaveTextContent("2026-02-30");
});

test("centers a single-line comment vertically in its two-line slot", () => {
  const style = document.createElement("style");
  const indexCss = readFileSync("src/client/index.css", "utf8");
  style.textContent = indexCss.replace(/^@(import|plugin|config).*$/gm, "");
  document.head.append(style);

  try {
    render(
      <DataTable
        applications={[application]}
        onSelect={vi.fn()}
        sortField="score"
        sortOrder="desc"
        onSort={vi.fn()}
      />,
    );

    const applicationRow = screen.getByRole("row", { name: /acme labs/i });
    const comment = applicationRow.querySelector<HTMLElement>(
      ".privacy-noise--table-notes .privacy-noise__content",
    );
    const text = applicationRow.querySelector<HTMLElement>(
      ".privacy-noise--table-notes .privacy-noise__text",
    );

    expect(comment).not.toBeNull();
    expect(text).not.toBeNull();

    const commentStyle = window.getComputedStyle(comment!);
    expect(commentStyle.display).toBe("flex");
    expect(commentStyle.alignItems).toBe("center");
    expect(commentStyle.minHeight).toBe("36px");
    expect(commentStyle.maxHeight).toBe("36px");

    const textStyle = window.getComputedStyle(text!);
    expect(textStyle.display).toBe("-webkit-box");
    expect(textStyle.webkitBoxOrient).toBe("vertical");
    expect(textStyle.webkitLineClamp).toBe("2");
    expect(textStyle.overflow).toBe("hidden");
  } finally {
    style.remove();
  }
});

test("shows the latest tagged comment and expands progress in reverse chronological order", async () => {
  const user = userEvent.setup();
  const notes = [
    "[2025-08-20·Applied] Submitted resume",
    "[2025-08-21·Evaluated] Strong match",
  ].join("\n");

  render(
    <DataTable
      applications={[{ ...application, notes }]}
      onSelect={vi.fn()}
      sortField="score"
      sortOrder="desc"
      onSort={vi.fn()}
    />,
  );

  const applicationRow = screen.getByRole("row", { name: /acme labs/i });
  expect(applicationRow).toHaveTextContent("Strong match");
  expect(applicationRow).not.toHaveTextContent("Submitted resume");
  expect(applicationRow).not.toHaveTextContent("[2025-08-21·Evaluated]");

  await user.click(applicationRow);

  const timelineStatuses = screen.getAllByRole("heading", { level: 4 });
  expect(timelineStatuses).toHaveLength(2);
  expect(timelineStatuses[0]).toHaveTextContent("Status: Evaluated");
  expect(timelineStatuses[1]).toHaveTextContent("Status: Applied");
  expect(screen.getByText("21.08")).toBeInTheDocument();
});

test.each([
  ["invalid date", "[2026-13-40·Evaluated] Keep this literal"],
  ["blank status", "[2026-08-21·   ] Keep this literal"],
])("keeps comments with an %s in the legacy format", async (_case, notes) => {
  const user = userEvent.setup();

  render(
    <DataTable
      applications={[{ ...application, notes }]}
      onSelect={vi.fn()}
      sortField="score"
      sortOrder="desc"
      onSort={vi.fn()}
    />,
  );

  const applicationRow = screen.getByRole("row", { name: /acme labs/i });
  expect(applicationRow).toHaveTextContent(notes.replace(/\s+/g, " "));

  await user.click(applicationRow);

  expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent("Status: INTERVIEW");
});
