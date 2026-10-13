// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { StatsOverview } from "./StatsOverview.js";

afterEach(cleanup);

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
  expect(html).toMatch(/Response Rate.*50.*%/);
});

test("counts every submitted status in Total Applied", () => {
  render(
    <StatsOverview
      applications={[
        { score: "4.8/5", status: "Applied" },
        { score: "4.2/5", status: "Responded" },
        { score: "4.5/5", status: "Interview" },
        { score: "4.1/5", status: "Offer" },
        { score: "4.4/5", status: "Rejected" },
        { score: "4.0/5", status: "Discarded" },
        { score: "4.3/5", status: "Evaluated" },
        { score: "4.6/5", status: "Skip" },
      ]}
    />,
  );

  const totalAppliedCard = screen.getByText("Total Applied").closest<HTMLDivElement>(".stats-card");
  expect(totalAppliedCard).not.toBeNull();
  expect(within(totalAppliedCard!).getByText("6")).toBeInTheDocument();
});

test("uses three columns before collapsing the six statistic cards into two columns", () => {
  render(<StatsOverview applications={[]} />);

  const statsGrid = screen.getByText("Total Evaluated").closest("section");
  expect(statsGrid).toHaveClass("grid-cols-2", "sm:grid-cols-3", "lg:grid-cols-6");
});

test("reserves two label lines above every statistic value", () => {
  render(<StatsOverview applications={[]} />);

  expect(screen.getByText("Offers")).toHaveClass("min-h-[28px]");
  expect(screen.getByText("Total Evaluated")).toHaveClass("min-h-[28px]");
});

test("orders application stages from evaluation through interview", () => {
  render(<StatsOverview applications={[]} />);

  const statsGrid = screen.getByText("Total Evaluated").closest("section");
  const stageLabels = Array.from(statsGrid!.children)
    .slice(0, 4)
    .map((card) => card.firstElementChild?.textContent);

  expect(stageLabels).toEqual([
    "Total Evaluated",
    "Total Applied",
    "Active Processes",
    "Interview Stage",
  ]);
});

test("uses the approved light blue value for Total Applied in both themes", () => {
  render(<StatsOverview applications={[]} />);

  const totalAppliedCard = screen.getByText("Total Applied").closest<HTMLDivElement>(".stats-card");
  expect(totalAppliedCard).not.toBeNull();
  expect(within(totalAppliedCard!).getByText("0")).toHaveClass(
    "text-blue-500",
    "dark:text-blue-300",
  );
});

test("uses the existing primary accent for active processes", () => {
  render(<StatsOverview applications={[]} />);

  const activeProcessesCard = screen
    .getByText("Active Processes")
    .closest<HTMLDivElement>(".stats-card");
  expect(activeProcessesCard).not.toBeNull();
  expect(within(activeProcessesCard!).getByText("0")).toHaveClass("text-primary");
});

test("activates the achievement styling only while actual offers are present", () => {
  const { rerender } = render(<StatsOverview applications={[]} />);
  const offerCard = screen.getByText("Offers").closest<HTMLDivElement>(".stats-card");
  expect(offerCard).not.toBeNull();
  expect(offerCard).toHaveClass("border-border-subtle", "hover:border-primary/50");
  expect(within(offerCard!).getByText("0")).toHaveClass("text-text-secondary");

  rerender(<StatsOverview applications={[{ score: "4.8/5", status: "Offer" }]} />);
  expect(offerCard).toHaveClass("stats-card--achievement", "border-on-surface");
  expect(offerCard).not.toHaveClass("border-border-subtle", "hover:border-primary/50");
  expect(within(offerCard!).getByText("1")).toHaveClass(
    "text-emerald-600",
    "dark:text-emerald-400",
  );

  rerender(<StatsOverview applications={[{ score: "4.8/5", status: "Interview" }]} />);
  expect(offerCard).not.toHaveClass("stats-card--achievement", "border-on-surface");
  expect(within(offerCard!).getByText("0")).toHaveClass("text-text-secondary");
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
  expect(html).not.toMatch(/stats-card--achievement/);
});

test("counts hired applications alongside offers and highlights the achievement", () => {
  const { rerender } = render(
    <StatsOverview applications={[{ score: "4.8/5", status: "HIRED" }]} />,
  );
  const offerCard = screen.getByText("Offers").closest<HTMLDivElement>(".stats-card");
  expect(within(offerCard!).getByText("1")).toBeInTheDocument();
  expect(offerCard).toHaveClass("stats-card--achievement", "border-on-surface");

  rerender(
    <StatsOverview
      applications={[
        { score: "4.8/5", status: "HIRED" },
        { score: "4.5/5", status: "Hired" },
        { score: "4.2/5", status: "Offer" },
        { score: "4.0/5", status: "Interview" },
      ]}
    />,
  );
  expect(within(offerCard!).getByText("3")).toBeInTheDocument();
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
  expect(html).toMatch(/Total Evaluated.*7/);
  expect(html).toMatch(/Response Rate.*80.*%/);
});

test.each([
  { notes: "reason: no_response_over_month", expectedRate: "50%" },
  {
    notes: "[2026-08-01·Applied] Submitted; [2026-09-02·Rejected] reason: no_response_over_month",
    expectedRate: "50%",
  },
  { notes: "Reason:  NO_RESPONSE_OVER_MONTH", expectedRate: "50%" },
  { notes: "reason: role_filled", expectedRate: "100%" },
  { notes: "reason: no_response_over_month_other", expectedRate: "100%" },
  { notes: "Comment mentions no_response_over_month", expectedRate: "100%" },
  { notes: undefined, expectedRate: "100%" },
])("calculates response rate for rejection notes $notes", ({ notes, expectedRate }) => {
  render(
    <StatsOverview
      applications={[
        { score: "4.4/5", status: "Rejected", notes },
        { score: "4.2/5", status: "Responded" },
      ]}
    />,
  );

  const responseRateCard = screen.getByText("Response Rate").closest<HTMLDivElement>(".stats-card");
  expect(within(responseRateCard!).getByText(expectedRate)).toBeInTheDocument();

  const totalAppliedCard = screen.getByText("Total Applied").closest<HTMLDivElement>(".stats-card");
  expect(within(totalAppliedCard!).getByText("2")).toBeInTheDocument();
});

test("shows zero response rate when all submitted applications were rejected without a response", () => {
  const applications = [
    { score: "4.4/5", status: "Rejected", notes: "reason: no_response_over_month" },
    { score: "4.2/5", status: "REJECTED", notes: "reason: no_response_over_month" },
  ];
  render(<StatsOverview applications={applications} />);

  const responseRateCard = screen.getByText("Response Rate").closest<HTMLDivElement>(".stats-card");
  expect(within(responseRateCard!).getByText("0%")).toBeInTheDocument();
});
