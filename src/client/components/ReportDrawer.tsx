import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface ReportDrawerProps {
  reportPath: string;
  isOpen: boolean;
  onClose: () => void;
  company: string;
  role: string;
}

export function ReportDrawer({ reportPath, isOpen, onClose, company, role }: ReportDrawerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isOpen || !reportPath) return;

    const fetchReport = async () => {
      setLoading(true);
      setError("");
      setContent("");
      try {
        const filename = reportPath.replace(/^reports\//, "");
        const res = await fetch(`/api/reports/${encodeURIComponent(filename)}`);
        if (!res.ok) {
          throw new Error("Detailed report file not found on disk.");
        }
        const text = await res.text();
        setContent(text);
      } catch (err: any) {
        setError(err.message || "Failed to load report");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [isOpen, reportPath]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return React.createElement(
    React.Fragment,
    null,
    React.createElement("div", {
      className: `drawer-backdrop ${isOpen ? "open" : ""}`,
      onClick: onClose
    }),
    React.createElement(
      "div",
      { className: `drawer ${isOpen ? "open" : ""}` },
      React.createElement(
        "div",
        { className: "drawer-header" },
        React.createElement(
          "div",
          null,
          React.createElement("div", { className: "drawer-title" }, company),
          React.createElement("div", { style: { fontSize: "13px", color: "var(--text-muted)" } }, role)
        ),
        React.createElement("button", { className: "drawer-close-btn", onClick: onClose }, "✕")
      ),
      React.createElement(
        "div",
        { className: "drawer-body" },
        loading && React.createElement("p", null, "Loading report..."),
        error && React.createElement("div", { style: { color: "var(--color-error)" } }, error),
        !loading && !error && content && React.createElement(
          "div",
          { className: "markdown-content" },
          React.createElement(ReactMarkdown, null, content)
        )
      )
    )
  );
}
