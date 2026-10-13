// @vitest-environment jsdom
import React from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { RemindersWidget, type ReminderItem } from "./RemindersWidget.js";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const today = new Date(2030, 0, 10, 9);
const items: ReminderItem[] = [
  { date: "2030-01-15", company: "Google", notes: "Review application" },
  { date: "2030-01-09", company: "Microsoft", notes: "Send a follow-up" },
  { date: "2030-01-10", company: "Example Corp", notes: "Prepare for interview" },
  { date: "2030-01-11", company: "Demo Systems", notes: "Confirm availability" },
];

test("sorts reminders chronologically and renders dashboard date labels", () => {
  render(<RemindersWidget items={items} today={today} isBlurred={false} />);

  const list = screen.getByRole("list", { name: "Reminders list" });
  expect(list).toHaveClass("overflow-y-auto");
  expect(
    within(list)
      .getAllByRole("listitem")
      .map((row) => row.textContent),
  ).toEqual([
    expect.stringContaining("Yesterday · Jan 9"),
    expect.stringContaining("Today · Jan 10"),
    expect.stringContaining("Tomorrow · Jan 11"),
    expect.stringContaining("Tuesday · Jan 15"),
  ]);
});

test("keeps every reminder row in the scrollable list", () => {
  const many = Array.from({ length: 8 }, (_, index) => ({
    date: `2030-02-${String(index + 1).padStart(2, "0")}`,
    company: `Company ${index}`,
    notes: `Note ${index}`,
  }));
  render(<RemindersWidget items={many} today={today} isBlurred={false} />);

  expect(screen.getByRole("region", { name: "Reminders" })).toHaveClass(
    "h-[17rem]",
    "flex",
    "flex-col",
  );
  expect(screen.getByRole("list", { name: "Reminders list" })).toHaveClass("overflow-y-auto");
  expect(screen.getByRole("list", { name: "Reminders list" })).toHaveAttribute("tabindex", "0");
  expect(screen.getAllByRole("listitem")).toHaveLength(many.length);
});

test("uses a distinct surface for reminder rows", () => {
  render(<RemindersWidget items={[items[0]]} today={today} isBlurred={false} />);

  expect(screen.getByRole("listitem")).toHaveClass("bg-surface-container");
  expect(screen.getByRole("listitem")).not.toHaveClass("bg-surface-container-low");
});

test("aligns the Reminders heading with Activity without a decorative icon", () => {
  render(<RemindersWidget items={items} today={today} isBlurred={false} />);

  const region = screen.getByRole("region", { name: "Reminders" });
  expect(region).toHaveClass("p-4", "md:p-6");
  expect(screen.getByRole("heading", { name: "Reminders (4)" }).parentElement).toHaveClass(
    "mb-stack-md",
    "flex",
    "items-baseline",
    "justify-between",
    "gap-4",
  );
  expect(region.querySelector("svg")).not.toBeInTheDocument();
});

test("briefly reveals the reminders scrollbar after scrolling", () => {
  vi.useFakeTimers();
  render(<RemindersWidget items={items} today={today} isBlurred={false} />);

  const list = screen.getByRole("list", { name: "Reminders list" });
  expect(list.parentElement?.querySelector(".overlay-scrollbar--vertical")).not.toBeInTheDocument();

  fireEvent.scroll(list);
  expect(list.parentElement?.querySelector(".overlay-scrollbar--vertical")).toBeInTheDocument();

  act(() => vi.advanceTimersByTime(900));
  expect(list.parentElement?.querySelector(".overlay-scrollbar--vertical")).not.toBeInTheDocument();
});

test("shows an ellipsis followed by the last 140 Unicode characters of long notes", () => {
  const tail = "🙂".repeat(140);
  const notes = `Earlier tracker history that should be hidden. ${tail}`;
  render(
    <RemindersWidget
      items={[{ date: "2030-01-10", company: "Google", notes }]}
      today={today}
      isBlurred={false}
    />,
  );

  expect(screen.getByText(`…${tail}`)).toBeInTheDocument();
  expect(screen.queryByText(notes)).not.toBeInTheDocument();
});

test("shows an accessible empty state", () => {
  render(<RemindersWidget items={[]} today={today} isBlurred={false} />);

  expect(screen.getByRole("heading", { name: "Reminders (0)" })).toBeInTheDocument();
  expect(screen.getByText("No reminders scheduled.")).toBeInTheDocument();
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
});

test("applies privacy noise to company and notes while blurred", () => {
  render(<RemindersWidget items={[items[0]]} today={today} isBlurred />);

  expect(screen.getByText("Google").parentElement).toHaveClass(
    "privacy-noise",
    "privacy-noise--company",
    "privacy-noise--active",
  );
  expect(screen.getByText("Review application").parentElement).toHaveClass(
    "privacy-noise",
    "privacy-noise--timeline-notes",
    "privacy-noise--active",
  );
});

test("does not activate privacy noise when privacy mode is off", () => {
  render(<RemindersWidget items={[items[0]]} today={today} isBlurred={false} />);

  expect(screen.getByText("Google").parentElement).not.toHaveClass("privacy-noise--active");
  expect(screen.getByText("Review application").parentElement).not.toHaveClass(
    "privacy-noise--active",
  );
});
