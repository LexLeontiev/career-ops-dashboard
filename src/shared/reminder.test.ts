import { describe, expect, test } from "vitest";
import { parseFollowUpCadence, parseRemindersPayload } from "./reminder.js";

const validReminder = {
  appNum: 101,
  date: "2030-01-15",
  company: "Google",
  notes: "Schedule a technical interview.",
  urgency: "overdue" as const,
};

describe("follow-up cadence parsing", () => {
  test("maps dated cadence entries and omits cold entries without a next date", () => {
    expect(
      parseFollowUpCadence({
        metadata: {
          analysisDate: "2030-01-10",
          actionable: 3,
          overdue: 1,
          urgent: 0,
          cold: 1,
          waiting: 1,
        },
        entries: [
          {
            num: 101,
            company: "Google",
            notes: "Schedule a technical interview.",
            urgency: "overdue",
            nextFollowupDate: "2030-01-15",
          },
          {
            num: 202,
            company: "Microsoft",
            notes: "Send a follow-up email.",
            urgency: "waiting",
            nextFollowupDate: "2030-01-22",
          },
          {
            num: 303,
            company: "Example Corp",
            notes: "No further action is needed.",
            urgency: "cold",
            nextFollowupDate: null,
          },
        ],
      }),
    ).toEqual([
      validReminder,
      {
        appNum: 202,
        date: "2030-01-22",
        company: "Microsoft",
        notes: "Send a follow-up email.",
        urgency: "waiting",
      },
    ]);
  });

  test.each([
    null,
    {},
    { entries: null },
    { entries: [{ ...validReminder, num: 101, nextFollowupDate: "2030-02-30" }] },
    { entries: [{ ...validReminder, num: "101", nextFollowupDate: "2030-01-15" }] },
    { entries: [{ ...validReminder, num: 101, nextFollowupDate: "2030-01-15", urgency: "soon" }] },
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
