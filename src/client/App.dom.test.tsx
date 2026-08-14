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

describe("App application loading lifecycle", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  test("announces loading, then renders validated applications", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(applicationsResponse()));

    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading applications…");
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
    expect(screen.getByText("Acme Labs")).toBeInTheDocument();
  });

  test("announces a stable error when loading rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue("network unavailable"));

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Failed to load applications");
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
