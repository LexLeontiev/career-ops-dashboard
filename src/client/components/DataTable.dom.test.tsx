// @vitest-environment jsdom
import React from "react";
import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import type { Application } from "../../shared/application.js";
import { DataTable } from "./DataTable.js";

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

  expect(
    screen.getByRole("button", { name: /open report for acme labs/i }),
  ).toBeInTheDocument();
});
