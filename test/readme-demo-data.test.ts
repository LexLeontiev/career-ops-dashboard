import { expect, test } from "vitest";
import { buildActivityDays, trackerAndNotesDateStrategy } from "../src/client/activity.js";
import { createReadmeDemoData } from "../scripts/readme-demo-data.js";

const captureDate = new Date(2026, 7, 20, 12);

test("provides a statistically complete, public README dashboard dataset", () => {
  const { applications, reminders } = createReadmeDemoData(captureDate);
  const statusCounts = (statuses: string[]) =>
    applications.filter(({ status }) => statuses.includes(status.toUpperCase()));

  expect(applications).toHaveLength(56);
  expect(statusCounts(["APPLIED", "INTERVIEW", "RESPONDED"])).toHaveLength(11);
  expect(statusCounts(["INTERVIEW"])).toHaveLength(7);
  expect(statusCounts(["OFFER"])).toHaveLength(1);
  expect(statusCounts(["RESPONDED", "INTERVIEW", "OFFER", "REJECTED"])).toHaveLength(19);
  expect(applications.every(({ status }) => /^[A-Z][a-z]+$/.test(status))).toBe(true);
  expect(applications.map(({ company }) => company)).toEqual(
    expect.arrayContaining(["Google", "Meta", "Stripe", "Figma", "Vercel"]),
  );
  expect(reminders).toHaveLength(5);
  expect(reminders.map(({ company }) => company)).toEqual(
    expect.arrayContaining(["Google", "Meta", "Stripe"]),
  );
});

test("shows varied scores in the first five active README rows", () => {
  const { applications } = createReadmeDemoData(captureDate);
  const active = applications
    .filter(({ status }) => ["APPLIED", "INTERVIEW", "RESPONDED"].includes(status.toUpperCase()))
    .sort((left, right) => Number.parseFloat(right.score) - Number.parseFloat(left.score));

  expect(active.slice(0, 5).map(({ company, score, status }) => [company, score, status])).toEqual([
    ["Google", "4.8/5", "Interview"],
    ["Meta", "4.2/5", "Responded"],
    ["Stripe", "3.8/5", "Interview"],
    ["Vercel", "3.7/5", "Applied"],
    ["Notion", "3.5/5", "Interview"],
  ]);
});

test("spreads README demo activity across the preceding two months", () => {
  const { applications } = createReadmeDemoData(captureDate);
  const activityDays = buildActivityDays(applications, trackerAndNotesDateStrategy, captureDate);

  expect(activityDays.find((day) => day.date === "2026-06-20")?.count).toBeGreaterThan(0);
  expect(activityDays.find((day) => day.date === "2026-08-20")?.count).toBeGreaterThan(0);
  expect(
    [...new Set(activityDays.map(({ count }) => count).filter((count) => count > 0))].sort(),
  ).toEqual([1, 2, 3, 4]);
});

test("includes a tagged active application for the timeline preview", () => {
  const { applications } = createReadmeDemoData(new Date(2026, 7, 23, 12));
  const timelineApplication = applications.find(({ company }) => company === "Google");

  expect(timelineApplication?.notes).toContain("[2026-08-03·Evaluated]");
  expect(timelineApplication?.notes).toContain("[2026-08-10·Applied]");
  expect(timelineApplication?.notes).toContain("[2026-08-18·Interview]");
  expect(timelineApplication?.status).toBe("Interview");
});
