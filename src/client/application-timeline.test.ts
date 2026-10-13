import { expect, test } from "vitest";
import { buildApplicationTimeline } from "./application-timeline.js";

const legacyApplication = {
  date: "2026-08-01",
  status: "INTERVIEW",
  notes: "Legacy comment",
};

test("parses multiline entries and sorts them newest first", () => {
  const notes = [
    "[2026-08-20·Applied] Submitted resume",
    "with a referral",
    "[2026-08-21·Evaluated] Strong match",
  ].join("\n");

  expect(buildApplicationTimeline({ ...legacyApplication, notes })).toEqual([
    {
      date: "2026-08-21",
      status: "Evaluated",
      comment: "Strong match",
    },
    {
      date: "2026-08-20",
      status: "Applied",
      comment: "Submitted resume\nwith a referral",
    },
  ]);
});

test.each(["[2026-13-40·Evaluated] Keep this literal", "[2026-08-21·   ] Keep this literal"])(
  "keeps an invalid tag as a legacy comment: %s",
  (notes) => {
    expect(buildApplicationTimeline({ ...legacyApplication, notes })).toEqual([
      {
        date: "2026-08-01",
        status: "INTERVIEW",
        comment: notes,
      },
    ]);
  },
);

test("dates the legacy preamble to the tracker row and parses subsequent events", () => {
  const notes = "Existing note\nwith another line\n[2026-08-21·Evaluated] Strong match";

  expect(buildApplicationTimeline({ ...legacyApplication, notes })).toEqual([
    {
      date: "2026-08-21",
      status: "Evaluated",
      comment: "Strong match",
    },
    {
      date: "2026-08-01",
      status: "Note",
      comment: "Existing note\nwith another line",
    },
  ]);
});

test("keeps tagged events ahead of the legacy note when their dates match", () => {
  expect(
    buildApplicationTimeline({
      ...legacyApplication,
      status: "HIRED",
      notes: "Old context\n[2026-08-01·Applied] Applied\n[2026-08-01·Interview] Interview",
    }),
  ).toEqual([
    { date: "2026-08-01", status: "Interview", comment: "Interview" },
    { date: "2026-08-01", status: "Applied", comment: "Applied" },
    { date: "2026-08-01", status: "Note", comment: "Old context" },
  ]);
});

test("keeps mixed valid and invalid tags in the legacy format", () => {
  const notes = [
    "[2026-08-21·Applied] Submitted resume",
    "[2026-13-40·Rejected] Keep this literal",
  ].join("\n");

  expect(buildApplicationTimeline({ ...legacyApplication, notes })).toEqual([
    {
      date: "2026-08-01",
      status: "INTERVIEW",
      comment: notes,
    },
  ]);
});
