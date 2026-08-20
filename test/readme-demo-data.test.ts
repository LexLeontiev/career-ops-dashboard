import { expect, test } from "vitest";
import { buildActivityDays, trackerAndNotesDateStrategy } from "../src/client/activity.js";
import { createReadmeDemoData } from "../scripts/readme-demo-data.js";

const captureDate = new Date(2026, 7, 20, 12);

test("provides a statistically complete, public README dashboard dataset", () => {
  const { applications, reminders } = createReadmeDemoData(captureDate);

  expect(applications).toHaveLength(56);
  expect(
    applications.filter(({ status }) => ["APPLIED", "INTERVIEW", "RESPONDED"].includes(status)),
  ).toHaveLength(11);
  expect(applications.filter(({ status }) => status === "INTERVIEW")).toHaveLength(7);
  expect(applications.filter(({ status }) => status === "OFFER")).toHaveLength(1);
  expect(
    applications.filter(({ status }) =>
      ["RESPONDED", "INTERVIEW", "OFFER", "REJECTED"].includes(status),
    ),
  ).toHaveLength(19);
  expect(applications.map(({ company }) => company)).toEqual(
    expect.arrayContaining(["Google", "Meta", "Stripe", "Figma", "Vercel"]),
  );
  expect(reminders).toHaveLength(5);
  expect(reminders.map(({ company }) => company)).toEqual(
    expect.arrayContaining(["Google", "Meta", "Stripe"]),
  );
});

test("spreads README demo activity across the preceding two months", () => {
  const { applications } = createReadmeDemoData(captureDate);
  const activityDays = buildActivityDays(applications, trackerAndNotesDateStrategy, captureDate);

  expect(activityDays.find((day) => day.date === "2026-06-20")?.count).toBeGreaterThan(0);
  expect(activityDays.find((day) => day.date === "2026-08-20")?.count).toBeGreaterThan(0);
});
