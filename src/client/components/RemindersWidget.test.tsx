// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { RemindersWidget, type ReminderItem } from "./RemindersWidget.js";

afterEach(cleanup);

const today = new Date(2026, 7, 20, 9);
const items: ReminderItem[] = [
  { date: "2026-08-25", company: "Northstar", notes: "Send portfolio" },
  { date: "2026-08-19", company: "Acme", notes: "Follow up" },
  { date: "2026-08-20", company: "Orbital", notes: "Interview prep" },
  { date: "2026-08-21", company: "Wayfinder", notes: "Confirm time" },
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
    expect.stringContaining("Yesterday · Aug 19"),
    expect.stringContaining("Today · Aug 20"),
    expect.stringContaining("Tomorrow · Aug 21"),
    expect.stringContaining("Tuesday · Aug 25"),
  ]);
});

test("keeps every reminder row in the scrollable list", () => {
  const many = Array.from({ length: 8 }, (_, index) => ({
    date: `2026-09-${String(index + 1).padStart(2, "0")}`,
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
  expect(screen.getAllByRole("listitem")).toHaveLength(many.length);
});

test("shows an ellipsis followed by the last 140 Unicode characters of long notes", () => {
  const tail = "🙂".repeat(140);
  const notes = `Earlier tracker history that should be hidden. ${tail}`;
  render(
    <RemindersWidget
      items={[{ date: "2026-08-20", company: "Acme", notes }]}
      today={today}
      isBlurred={false}
    />,
  );

  expect(screen.getByText(`…${tail}`)).toBeInTheDocument();
  expect(screen.queryByText(notes)).not.toBeInTheDocument();
});

test("shows an accessible empty state", () => {
  render(<RemindersWidget items={[]} today={today} isBlurred={false} />);

  expect(screen.getByRole("heading", { name: "Reminders" })).toBeInTheDocument();
  expect(screen.getByText("No reminders scheduled.")).toBeInTheDocument();
  expect(screen.queryAllByRole("listitem")).toHaveLength(0);
});

test("applies privacy noise to company and notes while blurred", () => {
  render(<RemindersWidget items={[items[0]]} today={today} isBlurred />);

  expect(screen.getByText("Northstar").parentElement).toHaveClass(
    "privacy-noise",
    "privacy-noise--company",
    "privacy-noise--active",
  );
  expect(screen.getByText("Send portfolio").parentElement).toHaveClass(
    "privacy-noise",
    "privacy-noise--timeline-notes",
    "privacy-noise--active",
  );
});

test("does not activate privacy noise when privacy mode is off", () => {
  render(<RemindersWidget items={[items[0]]} today={today} isBlurred={false} />);

  expect(screen.getByText("Northstar").parentElement).not.toHaveClass("privacy-noise--active");
  expect(screen.getByText("Send portfolio").parentElement).not.toHaveClass("privacy-noise--active");
});
