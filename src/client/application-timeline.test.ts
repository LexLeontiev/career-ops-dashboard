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

test("keeps mixed legacy text and tags in the legacy format", () => {
  const notes = "Existing note\n[2026-08-21·Evaluated] Strong match";

  expect(buildApplicationTimeline({ ...legacyApplication, notes })).toEqual([
    {
      date: "2026-08-01",
      status: "INTERVIEW",
      comment: notes,
    },
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
