// @vitest-environment jsdom
import React from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { ActivityHeatmap } from "./ActivityHeatmap.js";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

test("renders accessible cells for every activity intensity", () => {
  render(
    <ActivityHeatmap
      days={[
        { date: "2026-08-16", count: 0 },
        { date: "2026-08-17", count: 1 },
        { date: "2026-08-18", count: 2 },
        { date: "2026-08-19", count: 3 },
        { date: "2026-08-20", count: 5 },
      ]}
    />,
  );

  expect(screen.getByRole("heading", { name: "Activity" })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "August 16, 2026: 0 interactions" })).toHaveClass(
    "bg-surface-container-high",
  );
  expect(screen.getByRole("img", { name: "August 17, 2026: 1 interaction" })).toHaveClass(
    "bg-primary/20",
  );
  expect(screen.getByRole("img", { name: "August 18, 2026: 2 interactions" })).toHaveClass(
    "bg-primary/40",
  );
  expect(screen.getByRole("img", { name: "August 19, 2026: 3 interactions" })).toHaveClass(
    "bg-primary/70",
  );
  expect(screen.getByRole("img", { name: "August 20, 2026: 5 interactions" })).toHaveClass(
    "bg-primary",
  );
});

test("uses fine borders for calendar cells and intensity swatches", () => {
  render(<ActivityHeatmap days={[{ date: "2026-08-20", count: 2 }]} />);

  expect(screen.getByRole("img", { name: "August 20, 2026: 2 interactions" })).toHaveClass(
    "border-[0.5px]",
  );

  const grid = screen.getByRole("group", { name: "Daily activity grid" });
  for (const placeholder of grid.querySelectorAll("span")) {
    expect(placeholder).toHaveClass("border-[0.5px]");
  }

  const legend = screen.getByLabelText("Activity intensity: less to more");
  for (const swatch of legend.querySelectorAll("[aria-hidden='true']")) {
    expect(swatch).toHaveClass("border-[0.5px]");
  }
});

test("renders calendar labels, legend, and a scrollable activity region", () => {
  render(
    <ActivityHeatmap
      days={[
        { date: "2026-05-31", count: 0 },
        { date: "2026-06-01", count: 1 },
        { date: "2026-06-02", count: 0 },
        { date: "2026-06-03", count: 0 },
        { date: "2026-06-04", count: 0 },
        { date: "2026-06-05", count: 0 },
        { date: "2026-06-06", count: 0 },
        { date: "2026-06-07", count: 2 },
      ]}
    />,
  );

  expect(screen.getByRole("region", { name: "Activity" })).toHaveClass(
    "h-[17rem]",
    "w-full",
    "max-w-full",
  );
  const calendar = screen.getByRole("region", { name: "Activity calendar" });
  expect(calendar).toHaveClass("overflow-x-auto");
  expect(screen.getByText("Last 6 months")).toBeInTheDocument();
  expect(within(calendar).queryByText("May")).not.toBeInTheDocument();
  expect(within(calendar).getByText("Jun")).toBeInTheDocument();
  expect(within(calendar).getByText("Mon")).toBeInTheDocument();
  expect(within(calendar).getByText("Wed")).toBeInTheDocument();
  expect(within(calendar).getByText("Fri")).toBeInTheDocument();
  expect(screen.getByText("Less")).toBeInTheDocument();
  expect(screen.getByText("More")).toBeInTheDocument();
});

test("briefly reveals the activity scrollbar after horizontal scrolling", () => {
  vi.useFakeTimers();
  render(<ActivityHeatmap days={[{ date: "2026-08-20", count: 2 }]} />);

  const calendar = screen.getByRole("region", { name: "Activity calendar" });
  expect(calendar.parentElement?.querySelector(".overlay-scrollbar")).not.toBeInTheDocument();

  fireEvent.scroll(calendar);
  expect(calendar.parentElement?.querySelector(".overlay-scrollbar")).toBeInTheDocument();

  act(() => vi.advanceTimersByTime(900));
  expect(calendar.parentElement?.querySelector(".overlay-scrollbar")).not.toBeInTheDocument();
});

test("hides a prior month label when its first day is outside the activity range", () => {
  render(
    <ActivityHeatmap
      days={[
        { date: "2026-02-20", count: 0 },
        { date: "2026-02-21", count: 0 },
        { date: "2026-02-22", count: 0 },
        { date: "2026-02-23", count: 0 },
        { date: "2026-02-24", count: 0 },
        { date: "2026-02-25", count: 0 },
        { date: "2026-02-26", count: 0 },
        { date: "2026-02-27", count: 0 },
        { date: "2026-02-28", count: 0 },
        { date: "2026-03-01", count: 0 },
      ]}
    />,
  );

  const calendar = screen.getByRole("region", { name: "Activity calendar" });
  expect(within(calendar).queryByText("Feb")).not.toBeInTheDocument();
  expect(within(calendar).getByText("Mar")).toBeInTheDocument();
});

test("pads the first and last calendar columns to complete weeks", () => {
  render(
    <ActivityHeatmap
      days={[
        { date: "2026-08-19", count: 1 },
        { date: "2026-08-20", count: 0 },
      ]}
    />,
  );

  const grid = screen.getByRole("group", { name: "Daily activity grid" });
  expect(grid.children).toHaveLength(7);
  expect(within(grid).getAllByRole("img")).toHaveLength(2);
  const placeholders = Array.from(grid.children).filter((cell) => cell.tagName === "SPAN");
  expect(placeholders).toHaveLength(5);
  for (const placeholder of placeholders) {
    expect(placeholder).toHaveClass("bg-surface-container-high/40");
  }
});

test("shows the date and action count on hover and keyboard focus", async () => {
  const user = userEvent.setup();
  render(<ActivityHeatmap days={[{ date: "2026-08-20", count: 3 }]} />);
  const cell = screen.getByRole("img", { name: "August 20, 2026: 3 interactions" });

  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  await user.hover(cell);
  expect(screen.getByRole("tooltip")).toHaveTextContent("Aug 20 · 3 actions");

  await user.unhover(cell);
  expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

  await user.tab();
  expect(screen.getByRole("region", { name: "Activity calendar" })).toHaveFocus();
  await user.tab();
  expect(cell).toHaveFocus();
  expect(screen.getByRole("tooltip")).toHaveTextContent("Aug 20 · 3 actions");
});

test("keeps the tooltip while a cell remains hovered or focused", async () => {
  const user = userEvent.setup();
  render(<ActivityHeatmap days={[{ date: "2026-08-20", count: 3 }]} />);
  const calendar = screen.getByRole("region", { name: "Activity calendar" });
  const cell = screen.getByRole("img", { name: "August 20, 2026: 3 interactions" });

  await user.tab();
  await user.tab();
  await user.hover(cell);
  await user.unhover(cell);
  expect(cell).toHaveFocus();
  expect(screen.getByRole("tooltip")).toBeInTheDocument();

  await user.hover(cell);
  await user.tab({ shift: true });
  expect(calendar).toHaveFocus();
  expect(screen.getByRole("tooltip")).toBeInTheDocument();
});
