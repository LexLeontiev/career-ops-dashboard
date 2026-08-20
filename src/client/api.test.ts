import { describe, expect, test, vi } from "vitest";
import { fetchApplications, fetchReminders } from "./api.js";

describe("fetchApplications", () => {
  test("returns a validated application list and forwards the abort signal", async () => {
    const controller = new AbortController();
    const request = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
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
          },
        ]),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    await expect(fetchApplications(controller.signal, request)).resolves.toHaveLength(1);
    expect(request).toHaveBeenCalledWith("/api/applications", { signal: controller.signal });
  });

  test("rejects HTTP and malformed payloads", async () => {
    await expect(
      fetchApplications(
        new AbortController().signal,
        vi.fn().mockResolvedValue(new Response("{}", { status: 503 })),
      ),
    ).rejects.toThrow("Failed to load applications (HTTP 503)");

    await expect(
      fetchApplications(
        new AbortController().signal,
        vi.fn().mockResolvedValue(new Response("{}", { status: 200 })),
      ),
    ).rejects.toThrow("Invalid applications response");
  });

  test("identifies the server response for an uninitialized tracker", async () => {
    const response = new Response(
      JSON.stringify({
        code: "TRACKER_NOT_INITIALIZED",
        error: "The career-ops tracker has not been initialized.",
      }),
      { status: 404, headers: { "content-type": "application/json" } },
    );

    await expect(
      fetchApplications(new AbortController().signal, vi.fn().mockResolvedValue(response)),
    ).rejects.toMatchObject({ name: "TrackerNotInitializedError" });
  });
});

describe("fetchReminders", () => {
  test("returns validated reminders and forwards the abort signal", async () => {
    const controller = new AbortController();
    const request = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            appNum: 101,
            date: "2030-01-11",
            company: "Google",
            notes: "Schedule a technical interview.",
            urgency: "overdue",
          },
        ]),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    await expect(fetchReminders(controller.signal, request)).resolves.toEqual([
      {
        appNum: 101,
        date: "2030-01-11",
        company: "Google",
        notes: "Schedule a technical interview.",
        urgency: "overdue",
      },
    ]);
    expect(request).toHaveBeenCalledWith("/api/reminders", { signal: controller.signal });
  });

  test("rejects HTTP failures and malformed follow-up payloads", async () => {
    await expect(
      fetchReminders(
        new AbortController().signal,
        vi.fn().mockResolvedValue(new Response("{}", { status: 503 })),
      ),
    ).rejects.toThrow("Failed to load reminders (HTTP 503)");

    await expect(
      fetchReminders(
        new AbortController().signal,
        vi.fn().mockResolvedValue(new Response("{}", { status: 200 })),
      ),
    ).rejects.toThrow("Invalid reminders response");
  });
});
