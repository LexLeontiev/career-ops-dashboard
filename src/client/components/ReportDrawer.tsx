import React, { useEffect, useState } from "react";
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

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`drawer-backdrop ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />
      <div className={`drawer ${isOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <div>
            <div className="drawer-title">{company}</div>
            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>{role}</div>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="drawer-body">
          {loading && <p>Loading report...</p>}
          {error && <div style={{ color: "var(--color-error)" }}>{error}</div>}
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
