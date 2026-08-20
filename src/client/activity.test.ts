import { expect, test } from "vitest";
import type { Application } from "../shared/application.js";
import { buildActivityDays, trackerAndNotesDateStrategy, trackerDateStrategy } from "./activity.js";

const application: Application = {
  num: 1,
  date: "2026-08-20",
  company: "Acme Labs",
  via: "Direct",
  role: "Platform Engineer",
  score: "4.5/5",
  status: "INTERVIEW",
  pdf: "—",
  report: "001-acme-platform-engineer.md",
  notes: "Applied 2026-08-18; recruiter replied 2026-08-19",
};

test("tracker date strategy ignores dates embedded in notes", () => {
  expect(trackerDateStrategy(application)).toEqual(["2026-08-20"]);
});

test("tracker and notes strategy adds ISO dates from notes", () => {
  expect(trackerAndNotesDateStrategy(application)).toEqual([
    "2026-08-20",
    "2026-08-18",
    "2026-08-19",
  ]);
});

test("activity days count each application once per date", () => {
  const applications = [
    {
      ...application,
      date: "2026-08-18",
      notes: "Applied 2026-08-18; recruiter replied 2026-08-19",
    },
    {
      ...application,
      num: 2,
      company: "Beta Works",
      date: "2026-08-19",
      notes: "",
    },
  ];

  const days = buildActivityDays(
    applications,
    trackerAndNotesDateStrategy,
    new Date(2026, 7, 20, 12),
  );

  expect(days.find((day) => day.date === "2026-08-18")?.count).toBe(1);
  expect(days.find((day) => day.date === "2026-08-19")?.count).toBe(2);
});

test("activity days count the same company once per date across tracker rows", () => {
  const applications = [
    { ...application, date: "2026-08-19", notes: "" },
    {
      ...application,
      num: 2,
      role: "Engineering Manager",
      date: "2026-08-19",
      notes: "Follow-up 2026-08-19",
    },
  ];

  const days = buildActivityDays(
    applications,
    trackerAndNotesDateStrategy,
    new Date(2026, 7, 20, 12),
  );

  expect(days.find((day) => day.date === "2026-08-19")?.count).toBe(1);
});

test("activity days exclude dates after today", () => {
  const futureApplication = {
    ...application,
    date: "2026-08-21",
    notes: "Completed interaction 2026-08-20; planned follow-up 2026-08-22",
  };

  const days = buildActivityDays(
    [futureApplication],
    trackerAndNotesDateStrategy,
    new Date(2026, 7, 20, 12),
  );

  expect(days.at(-1)).toEqual({ date: "2026-08-20", count: 1 });
  expect(days.some((day) => day.date > "2026-08-20")).toBe(false);
});

test("activity days cover six calendar months through today", () => {
  const days = buildActivityDays([], trackerDateStrategy, new Date(2026, 7, 20, 12));

  expect(days[0]).toEqual({ date: "2026-02-20", count: 0 });
  expect(days.at(-1)).toEqual({ date: "2026-08-20", count: 0 });
  expect(days).toHaveLength(182);
});
