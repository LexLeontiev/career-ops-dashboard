// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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

  test("briefly reveals the page scrollbar after scrolling", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(applicationsResponse()));

    render(<App />);
    await screen.findByText("Acme Labs");

    fireEvent.scroll(window);
    expect(document.querySelector(".page-scrollbar-overlay")).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(900));
    expect(document.querySelector(".page-scrollbar-overlay")).not.toBeInTheDocument();
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
    vi.setSystemTime(new Date(2030, 0, 10, 12));
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        if (String(input) === "/api/reminders") {
          return Promise.resolve(
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
        }
        return Promise.resolve(applicationsResponse());
      }),
    );

    render(<App />);

    const activity = await screen.findByRole("region", { name: "Activity" });
    const reminders = screen.getByRole("region", { name: "Reminders" });
    expect(reminders).toHaveTextContent("Tomorrow · Jan 11");
    expect(reminders).toHaveTextContent("Google");
    expect(reminders).toHaveTextContent("Schedule a technical interview.");
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
    expect(screen.queryByRole("button", { name: /^Interview/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /^Interview/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Active 0" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Evaluated 0" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All Statuses 0" })).toBeInTheDocument();

    await user.clear(search);
    expect(screen.getByText("Acme Labs")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Interview 1" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Interview (1)" })).toBeInTheDocument();
  });

  test.each(["desktop", "mobile"])(
    "switches to All Statuses when the selected status disappears on %s",
    async (layout) => {
      const applications = [
        { ...application, num: 1, company: "Offer Company", status: "Offer" },
        { ...application, num: 2, company: "Rejected Company", status: "Rejected" },
      ];
      vi.stubGlobal(
        "fetch",
        vi.fn((input: RequestInfo | URL) =>
          Promise.resolve(
            new Response(
              JSON.stringify(String(input) === "/api/applications" ? applications : []),
              { status: 200, headers: { "content-type": "application/json" } },
            ),
          ),
        ),
      );
      const user = userEvent.setup();
      render(<App />);
      await screen.findByText("Offer Company");

      const select = screen.getByRole("combobox", { name: "Filter by Status" });
      if (layout === "mobile") {
        await user.selectOptions(select, "offer");
      } else {
        await user.click(screen.getByRole("button", { name: "Offer 1" }));
      }

      const search = screen.getByRole("textbox", { name: "Search applications" });
      await user.type(search, "Rejected Company");
      expect(screen.queryByRole("button", { name: /^Offer/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("option", { name: /^Offer/ })).not.toBeInTheDocument();
      expect(select).toHaveValue("all");
      expect(screen.getByRole("button", { name: "All Statuses 1" })).toHaveClass("bg-primary");
      expect(screen.getByText("Rejected Company")).toBeInTheDocument();

      await user.clear(search);
      expect(select).toHaveValue("all");
      expect(screen.getByText("Offer Company")).toBeInTheDocument();
      expect(screen.getByText("Rejected Company")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Offer 1" })).toBeInTheDocument();
    },
  );

  test("sorts Last Interaction by the newest timeline update in both directions", async () => {
    const applications = [
      {
        ...application,
        num: 1,
        company: "Latest Update Company",
        date: "2025-08-01",
        notes: "[2025-08-21·Interview] Latest update\n[2025-08-02·Applied] Earlier update",
      },
      {
        ...application,
        num: 2,
        company: "Earlier Update Company",
        date: "2025-08-10",
        notes: "[2025-08-15·Interview] Earlier update",
      },
      {
        ...application,
        num: 3,
        company: "Legacy Company",
        date: "2025-08-18",
        notes: "Undated legacy update",
      },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) =>
        Promise.resolve(
          new Response(JSON.stringify(String(input) === "/api/applications" ? applications : []), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        ),
      ),
    );
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText("Latest Update Company");

    const companiesInOrder = () =>
      within(screen.getByRole("table"))
        .getAllByRole("row")
        .slice(1)
        .map((row) => within(row).getAllByRole("cell")[1].textContent);
    const sortButton = screen.getByRole("button", { name: "Sort by Last Interaction" });
    await user.click(sortButton);
    expect(companiesInOrder()).toEqual([
      "Latest Update Company",
      "Legacy Company",
      "Earlier Update Company",
    ]);
    expect(screen.getByRole("columnheader", { name: /Last Interaction/ })).toHaveAttribute(
      "aria-sort",
      "descending",
    );

    await user.click(sortButton);
    expect(companiesInOrder()).toEqual([
      "Earlier Update Company",
      "Legacy Company",
      "Latest Update Company",
    ]);
    expect(screen.getByRole("columnheader", { name: /Last Interaction/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
  });

  test.each(["desktop", "mobile"])(
    "filters offers and hired applications on %s and includes them in Active",
    async (layout) => {
      const applications = [
        "Offer",
        "HIRED",
        "Applied",
        "Interview",
        "Responded",
        "Rejected",
        "Discarded",
        "Skip",
        "Evaluated",
      ].map((status, index) => ({
        ...application,
        num: index + 1,
        company: `${status} Company`,
        status,
      }));
      vi.stubGlobal(
        "fetch",
        vi.fn((input: RequestInfo | URL) =>
          Promise.resolve(
            new Response(
              JSON.stringify(String(input) === "/api/applications" ? applications : []),
              { status: 200, headers: { "content-type": "application/json" } },
            ),
          ),
        ),
      );
      const user = userEvent.setup();
      render(<App />);

      await screen.findByText("Offer Company");
      expect(screen.getByText("HIRED Company")).toBeInTheDocument();
      expect(screen.queryByText("Rejected Company")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Active 5" })).toBeInTheDocument();
      const activeCard = screen
        .getByText("Active Processes")
        .closest<HTMLDivElement>(".stats-card");
      expect(within(activeCard!).getByText("5")).toBeInTheDocument();

      const selectFilter = async (value: string, label: string) => {
        if (layout === "mobile") {
          await user.selectOptions(
            screen.getByRole("combobox", { name: "Filter by Status" }),
            value,
          );
        } else {
          await user.click(screen.getByRole("button", { name: label }));
        }
      };
      await selectFilter("offer", "Offer 2");
      expect(screen.getByText("Offer Company")).toBeInTheDocument();
      expect(screen.getByText("HIRED Company")).toBeInTheDocument();
      expect(screen.queryByText("Interview Company")).not.toBeInTheDocument();
      expect(screen.queryByText("Applied Company")).not.toBeInTheDocument();
      expect(screen.queryByText("Responded Company")).not.toBeInTheDocument();

      const search = screen.getByRole("textbox", { name: "Search applications" });
      await user.type(search, "Offer Company");
      expect(screen.getByText("Offer Company")).toBeInTheDocument();
      expect(screen.queryByText("HIRED Company")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Offer 1" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Active 1" })).toBeInTheDocument();
      await user.clear(search);

      await selectFilter("active", "Active 5");
      for (const status of ["Offer", "HIRED", "Applied", "Interview", "Responded"]) {
        expect(screen.getByText(`${status} Company`)).toBeInTheDocument();
      }
      for (const status of ["Rejected", "Discarded", "Skip", "Evaluated"]) {
        expect(screen.queryByText(`${status} Company`)).not.toBeInTheDocument();
      }
    },
  );
});
