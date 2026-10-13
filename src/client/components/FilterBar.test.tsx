// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { FilterBar } from "./FilterBar.js";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

test.each<{
  name: string;
  counts: Record<string, number>;
  buttons: string[];
  options: string[];
}>([
  {
    name: "all counts are zero",
    counts: {
      active: 0,
      evaluated: 0,
      all: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      skip: 0,
      rejected: 0,
      discarded: 0,
    },
    buttons: ["Active 0", "Evaluated 0", "All Statuses 0"],
    options: ["Active (0)", "Evaluated (0)", "All Statuses (0)"],
  },
  {
    name: "status counts are absent",
    counts: {},
    buttons: ["Active 0", "Evaluated 0", "All Statuses 0"],
    options: ["Active (0)", "Evaluated (0)", "All Statuses (0)"],
  },
  {
    name: "only some statuses have matches",
    counts: {
      active: 3,
      evaluated: 0,
      all: 6,
      applied: 1,
      interview: 0,
      offer: 2,
      skip: 0,
      rejected: 3,
      discarded: 0,
    },
    buttons: ["Active 3", "Evaluated 0", "All Statuses 6", "Applied 1", "Offer 2", "Rejected 3"],
    options: [
      "Active (3)",
      "Evaluated (0)",
      "All Statuses (6)",
      "Applied (1)",
      "Offer (2)",
      "Rejected (3)",
    ],
  },
])("shows only nonempty status filters when $name", ({ counts, buttons, options }) => {
  render(
    <FilterBar
      searchQuery=""
      setSearchQuery={() => {}}
      statusFilter="active"
      setStatusFilter={() => {}}
      counts={counts}
    />,
  );

  const statusButtons = within(screen.getByRole("group", { name: "Status filters" })).getAllByRole(
    "button",
  );
  expect(statusButtons.map((button) => button.textContent?.replace(/\s+/g, " ").trim())).toEqual(
    buttons,
  );
  const statusOptions = within(
    screen.getByRole("combobox", { name: "Filter by Status" }),
  ).getAllByRole("option");
  expect(statusOptions.map((option) => option.textContent)).toEqual(options);
});

test("restores status filters when their counts become positive again", () => {
  const props = {
    searchQuery: "",
    setSearchQuery: () => {},
    statusFilter: "active",
    setStatusFilter: () => {},
  };
  const { rerender } = render(<FilterBar {...props} counts={{ interview: 1, offer: 2 }} />);
  expect(screen.getByRole("button", { name: "Offer 2" })).toBeInTheDocument();

  rerender(<FilterBar {...props} counts={{ interview: 0, offer: 0 }} />);
  expect(screen.queryByRole("button", { name: /^Offer/ })).not.toBeInTheDocument();
  expect(screen.queryByRole("option", { name: /^Offer/ })).not.toBeInTheDocument();

  rerender(<FilterBar {...props} counts={{ interview: 1, offer: 2 }} />);
  expect(screen.getByRole("button", { name: "Offer 2" })).toBeInTheDocument();
  expect(screen.getByRole("option", { name: "Offer (2)" })).toBeInTheDocument();
});

test("shows Offer immediately after Interview in desktop and mobile filters", () => {
  render(
    <FilterBar
      searchQuery=""
      setSearchQuery={() => {}}
      statusFilter="active"
      setStatusFilter={() => {}}
      counts={{ active: 5, interview: 1, offer: 2 }}
    />,
  );

  const buttons = within(screen.getByRole("group", { name: "Status filters" })).getAllByRole(
    "button",
  );
  const interviewIndex = buttons.findIndex((button) => button.textContent?.startsWith("Interview"));
  expect(buttons[interviewIndex + 1]).toHaveTextContent("Offer 2");

  const options = within(screen.getByRole("combobox", { name: "Filter by Status" })).getAllByRole(
    "option",
  );
  const interviewOptionIndex = options.findIndex((option) =>
    option.textContent?.startsWith("Interview"),
  );
  expect(options[interviewOptionIndex + 1]).toHaveTextContent("Offer (2)");
  expect(options[interviewOptionIndex + 1]).toHaveValue("offer");
});

test("renders status select dropdown for mobile screens with correct counts and new option order", () => {
  const counts = {
    all: 10,
    active: 4,
    evaluated: 2,
    applied: 2,
    interview: 2,
    skip: 1,
    rejected: 2,
    discarded: 1,
  };
  const html = renderToString(
    React.createElement(FilterBar, {
      searchQuery: "",
      setSearchQuery: () => {},
      statusFilter: "active",
      setStatusFilter: () => {},
      counts,
    }),
  );

  expect(html).toMatch(/<select/);
  expect(html).toMatch(/id="status-select"/);
  expect(html).toMatch(/Active \(4\)/);
  expect(html).toMatch(/All Statuses \(10\)/);

  // Verify Active appears before Evaluated, and Evaluated appears before All Statuses
  const activeIdx = html.indexOf('value="active"');
  const evaluatedIdx = html.indexOf('value="evaluated"');
  const allIdx = html.indexOf('value="all"');

  expect(activeIdx !== -1, "active option exists").toBeTruthy();
  expect(evaluatedIdx !== -1, "evaluated option exists").toBeTruthy();
  expect(allIdx !== -1, "all option exists").toBeTruthy();
  expect(activeIdx < evaluatedIdx, "Active appears before Evaluated").toBeTruthy();
  expect(evaluatedIdx < allIdx, "Evaluated appears before All Statuses").toBeTruthy();
});

test("briefly reveals the status filters scrollbar after scrolling", () => {
  vi.useFakeTimers();
  render(
    <FilterBar
      searchQuery=""
      setSearchQuery={() => {}}
      statusFilter="active"
      setStatusFilter={() => {}}
      counts={{
        all: 10,
        active: 4,
        evaluated: 2,
        applied: 2,
        interview: 2,
        skip: 1,
        rejected: 2,
        discarded: 1,
      }}
    />,
  );

  const statusFilters = screen.getByRole("button", { name: /Active/ }).parentElement;
  expect(statusFilters).not.toBeNull();
  expect(statusFilters!.parentElement?.querySelector(".overlay-scrollbar")).not.toBeInTheDocument();

  fireEvent.scroll(statusFilters!);
  expect(statusFilters!.parentElement?.querySelector(".overlay-scrollbar")).toBeInTheDocument();

  act(() => vi.advanceTimersByTime(900));
  expect(statusFilters!.parentElement?.querySelector(".overlay-scrollbar")).not.toBeInTheDocument();
});
