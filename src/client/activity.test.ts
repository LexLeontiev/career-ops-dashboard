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

test("marks the first recorded offer day even after the application is hired", () => {
  const days = buildActivityDays(
    [
      {
        ...application,
        status: "HIRED",
        date: "2026-08-01",
        notes: [
          "Old application context without a date tag",
          "[2026-08-20·Hired] Accepted the offer",
          "[2026-08-19·OFFER] Updated compensation details",
          "[2026-08-18·Offer] Received the offer",
          "[2026-08-10·Interview] Final interview",
        ].join("\n"),
      },
    ],
    trackerAndNotesDateStrategy,
    new Date(2026, 7, 20, 12),
  );

  expect(days.find((day) => day.date === "2026-08-18")).toMatchObject({ count: 1, hasOffer: true });
  for (const date of ["2026-08-01", "2026-08-10", "2026-08-19", "2026-08-20"]) {
    expect(days.find((day) => day.date === date)).not.toHaveProperty("hasOffer", true);
  }
});

test("uses the dated hired milestone when no offer event is recorded", () => {
  const days = buildActivityDays(
    [
      {
        ...application,
        status: "HIRED",
        notes: "[2026-08-19·hired] Joined the team\n[2026-08-18·Interview] Final interview",
      },
    ],
    trackerAndNotesDateStrategy,
    new Date(2026, 7, 20, 12),
  );

  expect(days.find((day) => day.date === "2026-08-19")).toMatchObject({ hasOffer: true });
  expect(days.find((day) => day.date === "2026-08-20")).not.toHaveProperty("hasOffer", true);
});

test.each(["Offer", "HIRED"])("marks legacy %s records on their tracker date", (status) => {
  const days = buildActivityDays(
    [{ ...application, status, notes: "Undated comment" }],
    trackerAndNotesDateStrategy,
    new Date(2026, 7, 20, 12),
  );

  expect(days.at(-1)).toMatchObject({ date: "2026-08-20", count: 1, hasOffer: true });
});

test("retains offer history for closed applications and excludes future milestones", () => {
  const days = buildActivityDays(
    [
      { ...application, status: "Rejected", notes: "[2026-08-19·Offer] Offer received" },
      {
        ...application,
        num: 2,
        company: "Beta Works",
        status: "Offer",
        notes: "[2026-08-21·Offer] Future milestone",
      },
    ],
    trackerAndNotesDateStrategy,
    new Date(2026, 7, 20, 12),
  );

  expect(days.find((day) => day.date === "2026-08-19")).toMatchObject({ count: 1, hasOffer: true });
  expect(days.at(-1)).toEqual({ date: "2026-08-20", count: 2 });
  expect(days.filter((day) => "hasOffer" in day)).toHaveLength(1);
});
