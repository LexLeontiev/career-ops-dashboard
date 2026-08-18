import { describe, expect, test } from "vitest";
import { isApplication, parseApplicationsPayload } from "./application.js";

const validApplication = {
  num: 1,
  date: "2026-08-01",
  company: "Acme Labs",
  via: "—",
  role: "Platform Engineer",
  score: "4.5/5",
  status: "INTERVIEW",
  pdf: "✅",
  report: "001-acme-platform-engineer.md",
  notes: "Synthetic fixture",
};

describe("application payload validation", () => {
  test("accepts the canonical application shape", () => {
    expect(isApplication(validApplication)).toBe(true);
    expect(parseApplicationsPayload([validApplication])).toEqual([validApplication]);
  });

  test.each([
    null,
    {},
    [null],
    [{ ...validApplication, num: "1" }],
    [{ ...validApplication, pdf: null }],
  ])("rejects malformed payload %#", (payload) => {
    expect(() => parseApplicationsPayload(payload)).toThrow("Invalid applications response");
  });
});
