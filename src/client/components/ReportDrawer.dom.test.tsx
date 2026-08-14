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
  vi.stubGlobal("fetch", vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
    requestSignal = init?.signal ?? undefined;
    return new Promise<Response>(() => {});
  }));
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

  expect(screen.getByRole("dialog", { name: /acme labs/i })).toHaveAttribute(
    "aria-modal",
    "true",
  );
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
      new Response(
        "[External](https://example.com)\n\n<script>alert(1)</script>",
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
      role="Platform Engineer"
    />,
  );

  const link = await screen.findByRole("link", { name: "External" });
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  expect(container.querySelector("script")).not.toBeInTheDocument();
});
