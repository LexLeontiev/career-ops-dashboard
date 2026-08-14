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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !reportPath) return;
    const controller = new AbortController();

    const fetchReport = async () => {
      setLoading(true);
      setError("");
      setContent("");
      try {
        const filename = reportPath.replace(/^reports\//, "");
        const res = await fetch(`/api/reports/${encodeURIComponent(filename)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("Detailed report file not found on disk.");
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
  }, [isOpen, reportPath]);

  useEffect(() => {
    if (!isOpen) return;

    openerRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      openerRef.current?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`drawer-backdrop ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />
      <div
        className={`drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-drawer-title"
      >
        <div className="drawer-header">
          <div>
            <div className="drawer-title" id="report-drawer-title">{company}</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{role}</div>
          </div>
          <button ref={closeButtonRef} type="button" className="drawer-close-btn" onClick={onClose} aria-label="Close report">
            <X aria-hidden="true" focusable="false" />
          </button>
        </div>
        <div className="drawer-body">
          {loading && <p role="status">Loading report...</p>}
          {error && <div role="alert" style={{ color: "var(--color-error)" }}>{error}</div>}
          {!loading && !error && content && (
            <div className="prose dark:prose-invert prose-sm md:prose-base">
              <ReactMarkdown
                remarkPlugins={remarkPlugins}
                rehypePlugins={rehypePlugins}
                components={{
                  a: ({ node, ...props }) => (
                    <a {...props} target="_blank" rel="noopener noreferrer" />
                  ),
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
