// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { ReportDrawer } from "./ReportDrawer.js";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.style.overflow = "";
});

test("implements the open dialog focus, Escape, request, and scroll lifecycle", async () => {
  const user = userEvent.setup();
  const openerView = render(<button type="button">Open Acme report</button>);
  const opener = screen.getByRole("button", { name: "Open Acme report" });
  opener.focus();

  let requestSignal: AbortSignal | undefined;
  vi.stubGlobal(
    "fetch",
    vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      requestSignal = init?.signal ?? undefined;
      return new Promise<Response>(() => {});
    }),
  );
  const onClose = vi.fn();
  document.body.style.overflow = "clip";

  const { unmount } = render(
    <ReportDrawer
      reportPath="reports/acme.md"
      isOpen
      onClose={onClose}
      company="Acme Labs"
      role="Platform Engineer"
    />,
  );

  expect(screen.getByRole("dialog", { name: /acme labs/i })).toHaveAttribute("aria-modal", "true");
  expect(screen.getByRole("button", { name: /close report/i })).toHaveFocus();
  expect(screen.getByRole("status")).toHaveTextContent("Loading report");
  expect(document.body.style.overflow).toBe("hidden");

  await user.keyboard("{Escape}");
  expect(onClose).toHaveBeenCalledTimes(1);
  expect(requestSignal?.aborted).toBe(false);

  unmount();
  expect(requestSignal?.aborted).toBe(true);
  expect(opener).toHaveFocus();
  expect(document.body.style.overflow).toBe("clip");
  openerView.unmount();
});

test("renders external Markdown links safely without enabling raw HTML", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response("[External](https://example.com)\n\n<script>alert(1)</script>", {
        status: 200,
      }),
    ),
  );

  const { container } = render(
    <ReportDrawer
      reportPath="reports/acme.md"
      isOpen
      onClose={vi.fn()}
      company="Acme Labs"
      role="Platform Engineer"
    />,
  );

  const link = await screen.findByRole("link", { name: "External" });
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  expect(container.querySelector("script")).not.toBeInTheDocument();
});

test("renders report metadata fields on separate lines", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          [
            "# Fit Report",
            "",
            "**Date:** 2026-08-16",
            "**URL:** https://example.com/jobs/android-engineer",
            "**Via:** —",
            "**Archetype:** Senior Android Engineer",
            "**Score:** 4.5/5",
            "**Legitimacy:** High Confidence",
            "**PDF:** pending",
          ].join("\n"),
          { status: 200 },
        ),
      ),
  );

  const { container } = render(
    <ReportDrawer
      reportPath="reports/acme.md"
      isOpen
      onClose={vi.fn()}
      company="Acme Labs"
      role="Senior Android Engineer"
    />,
  );

  await screen.findByRole("heading", { name: "Fit Report" });
  const metadata = container.querySelector(".prose p");
  expect(metadata).not.toBeNull();
  expect(metadata?.querySelectorAll("br")).toHaveLength(6);
});

test("does not open the drawer when the report path is empty", () => {
  const fetchReport = vi.fn();
  vi.stubGlobal("fetch", fetchReport);
  const openerView = render(<button type="button">Open unavailable report</button>);
  const opener = screen.getByRole("button", { name: "Open unavailable report" });
  opener.focus();

  render(
    <ReportDrawer
      reportPath=""
      isOpen
      onClose={vi.fn()}
      company="Acme Labs"
      role="Platform Engineer"
    />,
  );

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(fetchReport).not.toHaveBeenCalled();
  expect(opener).toHaveFocus();
  expect(document.body.style.overflow).toBe("");
  openerView.unmount();
});

test("keeps Tab and Shift+Tab focus inside the open drawer", async () => {
  const user = userEvent.setup();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("[External](https://example.com)", { status: 200 })),
  );

  render(
    <>
      <button type="button">Before drawer</button>
      <ReportDrawer
        reportPath="reports/acme.md"
        isOpen
        onClose={vi.fn()}
        company="Acme Labs"
        role="Platform Engineer"
      />
      <button type="button">After drawer</button>
    </>,
  );

  const closeButton = screen.getByRole("button", { name: /close report/i });
  const reportLink = await screen.findByRole("link", { name: "External" });
  expect(closeButton).toHaveFocus();

  await user.tab({ shift: true });
  expect(reportLink).toHaveFocus();

  await user.tab();
  expect(closeButton).toHaveFocus();
});

test.each([
  [404, "Detailed report file not found on disk."],
  [500, "Failed to load report."],
])("maps report HTTP %i responses to the appropriate error", async (status, message) => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status })));

  render(
    <ReportDrawer
      reportPath="reports/acme.md"
      isOpen
      onClose={vi.fn()}
      company="Acme Labs"
      role="Platform Engineer"
    />,
  );

  expect(await screen.findByRole("alert")).toHaveTextContent(message);
});
