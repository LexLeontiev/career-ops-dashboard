import { describe, expect, test } from "vitest";
import { parseFollowUpCadence, parseRemindersPayload } from "./reminder.js";

const validReminder = {
  appNum: 29,
  date: "2026-08-13",
  company: "Proton",
  notes: "Interview completed; outcome pending.",
  urgency: "overdue" as const,
};

describe("follow-up cadence parsing", () => {
  test("maps dated cadence entries and omits cold entries without a next date", () => {
    expect(
      parseFollowUpCadence({
        metadata: {
          analysisDate: "2026-08-20",
          actionable: 3,
          overdue: 1,
          urgent: 0,
          cold: 1,
          waiting: 1,
        },
        entries: [
          {
            num: 29,
            company: "Proton",
            notes: "Interview completed; outcome pending.",
            urgency: "overdue",
            nextFollowupDate: "2026-08-13",
          },
          {
            num: 86,
            company: "Pure",
            notes: "Applied on 2026-08-17.",
            urgency: "waiting",
            nextFollowupDate: "2026-08-24",
          },
          {
            num: 52,
            company: "Yazio",
            notes: "Two follow-ups already sent.",
            urgency: "cold",
            nextFollowupDate: null,
          },
        ],
      }),
    ).toEqual([
      validReminder,
      {
        appNum: 86,
        date: "2026-08-24",
        company: "Pure",
        notes: "Applied on 2026-08-17.",
        urgency: "waiting",
      },
    ]);
  });

  test.each([
    null,
    {},
    { entries: null },
    { entries: [{ ...validReminder, num: 29, nextFollowupDate: "2026-02-30" }] },
    { entries: [{ ...validReminder, num: "29", nextFollowupDate: "2026-08-13" }] },
    { entries: [{ ...validReminder, num: 29, nextFollowupDate: "2026-08-13", urgency: "soon" }] },
  ])("rejects malformed cadence output %#", (payload) => {
    expect(() => parseFollowUpCadence(payload)).toThrow("Invalid follow-up cadence output");
  });
});

describe("reminder payload validation", () => {
  test("accepts the normalized reminder shape", () => {
    expect(parseRemindersPayload([validReminder])).toEqual([validReminder]);
  });

  test.each([
    null,
    {},
    [null],
    [{ ...validReminder, appNum: 0 }],
    [{ ...validReminder, notes: null }],
    [{ ...validReminder, date: "not-a-date" }],
    [{ ...validReminder, urgency: "soon" }],
  ])("rejects malformed API payload %#", (payload) => {
    expect(() => parseRemindersPayload(payload)).toThrow("Invalid reminders response");
  });
});
