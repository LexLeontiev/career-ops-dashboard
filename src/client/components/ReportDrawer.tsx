import React, { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeHighlight];

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
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const shouldOpen = isOpen && reportPath.trim().length > 0;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!shouldOpen) return;
    const controller = new AbortController();

    const fetchReport = async () => {
      setLoading(true);
      setError("");
      setContent("");
      try {
        const filename = reportPath.trim().replace(/^reports\//, "");
        const res = await fetch(`/api/reports/${encodeURIComponent(filename)}`, {
          signal: controller.signal,
        });
        if (res.status === 404) {
          throw new Error("Detailed report file not found on disk.");
        }
        if (!res.ok) {
          throw new Error("Failed to load report.");
        }
        const text = await res.text();
        setContent(text);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Failed to load report");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void fetchReport();
    return () => controller.abort();
  }, [reportPath, shouldOpen]);

  useEffect(() => {
    if (!shouldOpen) return;

    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !drawerRef.current) return;

      const focusableElements = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements.at(-1);
      if (!firstFocusable || !lastFocusable) {
        e.preventDefault();
        drawerRef.current.focus();
        return;
      }

      const focusIsOutsideDrawer =
        !(document.activeElement instanceof Node) ||
        !drawerRef.current.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === firstFocusable || focusIsOutsideDrawer)) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (
        !e.shiftKey &&
        (document.activeElement === lastFocusable || focusIsOutsideDrawer)
      ) {
        e.preventDefault();
        firstFocusable.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus();
    };
  }, [shouldOpen]);

  if (!shouldOpen) return null;

  return (
    <>
      <div className={`drawer-backdrop ${isOpen ? "open" : ""}`} onClick={onClose} />
      <div
        ref={drawerRef}
        className="drawer open"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-drawer-title"
        tabIndex={-1}
      >
        <div className="drawer-header">
          <div>
            <div className="drawer-title" id="report-drawer-title">
              {company}
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{role}</div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close report"
          >
            <X aria-hidden="true" focusable="false" />
          </button>
        </div>
        <div className="drawer-body">
          {loading && <p role="status">Loading report...</p>}
          {error && (
            <div role="alert" style={{ color: "var(--color-error)" }}>
              {error}
            </div>
          )}
          {!loading && !error && content && (
            <div className="prose dark:prose-invert prose-sm md:prose-base">
              <ReactMarkdown
                remarkPlugins={remarkPlugins}
                rehypePlugins={rehypePlugins}
                components={{
                  a: ({ node, ...props }) => {
                    void node;
                    return <a {...props} target="_blank" rel="noopener noreferrer" />;
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
