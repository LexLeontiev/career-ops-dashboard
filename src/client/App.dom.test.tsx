// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { Application } from "../shared/application.js";
import App from "./App.js";

const application: Application = {
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

function applicationsResponse(): Response {
  return new Response(JSON.stringify([application]), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function trackerNotInitializedResponse(): Response {
  return new Response(
    JSON.stringify({
      code: "TRACKER_NOT_INITIALIZED",
      error: "The career-ops tracker has not been initialized.",
    }),
    { status: 404, headers: { "content-type": "application/json" } },
  );
}

describe("App application loading lifecycle", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("announces loading, then renders validated applications", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(applicationsResponse()));

    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading applications…");
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
    expect(screen.getByText("Acme Labs")).toBeInTheDocument();
  });

  test("uses note dates for activity by default", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 7, 20, 12));
    const activityApplication = {
      ...application,
      notes: "Recruiter replied 2026-08-20",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([activityApplication]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    render(<App />);

    await screen.findByRole("heading", { name: "Activity" });
    expect(screen.getByRole("img", { name: "August 20, 2026: 1 interaction" })).toHaveClass(
      "bg-primary/20",
    );
  });

  test("renders follow-up reminders beside activity from the read-only API", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 7, 20, 12));
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        if (String(input) === "/api/reminders") {
          return Promise.resolve(
            new Response(
              JSON.stringify([
                {
                  appNum: 29,
                  date: "2026-08-21",
                  company: "Proton",
                  notes: "Interview complete; feedback pending.",
                  urgency: "overdue",
                },
              ]),
              { status: 200, headers: { "content-type": "application/json" } },
            ),
          );
        }
        return Promise.resolve(applicationsResponse());
      }),
    );

    render(<App />);

    const activity = await screen.findByRole("region", { name: "Activity" });
    const reminders = screen.getByRole("region", { name: "Reminders" });
    expect(reminders).toHaveTextContent("Tomorrow · Aug 21");
    expect(reminders).toHaveTextContent("Proton");
    expect(reminders).toHaveTextContent("Interview complete; feedback pending.");
    expect(activity.parentElement).toBe(reminders.parentElement);
    expect(activity.parentElement).toHaveClass("grid-cols-1", "lg:grid-cols-2");
    expect(activity).toHaveClass("h-[17rem]");
    expect(reminders).toHaveClass("h-[17rem]");
  });

  test("shows when reminders cannot be loaded instead of an empty state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        if (String(input) === "/api/reminders") {
          return Promise.reject(new Error("reminders unavailable"));
        }
        return Promise.resolve(applicationsResponse());
      }),
    );

    render(<App />);

    await screen.findByRole("region", { name: "Activity" });
    expect(screen.getByText("Reminders unavailable.")).toBeInTheDocument();
    expect(screen.queryByText("No reminders scheduled.")).not.toBeInTheDocument();
  });

  test("announces a stable error when loading rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue("network unavailable"));

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load applications");
  });

  test("shows activation guidance when the career-ops tracker is not initialized", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(trackerNotInitializedResponse()));

    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Activate your career-ops tracker" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    const quickStartLink = screen.getByRole("link", { name: "Open career-ops Quick Start" });
    expect(quickStartLink).toHaveAttribute(
      "href",
      "https://github.com/santifer/career-ops#quick-start",
    );
    expect(quickStartLink).toHaveAttribute("target", "_blank");
    expect(quickStartLink).toHaveAttribute("rel", "noreferrer");
  });

  test("ignores abort errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("Request aborted", "AbortError")),
    );

    render(<App />);

    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByText("Request aborted")).not.toBeInTheDocument();
  });

  test("aborts the application request on unmount", () => {
    let requestSignal: AbortSignal | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
        requestSignal = init?.signal ?? undefined;
        return new Promise<Response>(() => {});
      }),
    );

    const { unmount } = render(<App />);

    expect(requestSignal?.aborted).toBe(false);
    unmount();
    expect(requestSignal?.aborted).toBe(true);
  });

  test("persists privacy and theme choices", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(applicationsResponse()));
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText("Acme Labs");
    await user.click(screen.getByRole("button", { name: "Enable privacy mode" }));
    await user.click(screen.getByRole("button", { name: "Switch to light theme" }));

    expect(localStorage.getItem("career_ops_blur_mode")).toBe("true");
    expect(localStorage.getItem("career_ops_theme")).toBe("light");
  });

  test("filters loaded applications by search text and restores them when cleared", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(applicationsResponse()));
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText("Acme Labs");
    const search = screen.getByPlaceholderText("Search company, role, or notes...");
    await user.type(search, "No Match");
    expect(screen.queryByText("Acme Labs")).not.toBeInTheDocument();

    await user.clear(search);
    expect(screen.getByText("Acme Labs")).toBeInTheDocument();
  });
});
