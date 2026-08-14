import React, { useEffect, useState } from "react";
import type { Application } from "../../shared/application.js";

interface DataTableProps {
  applications: Application[];
  onSelect: (app: Application) => void;
  sortField: keyof Application | "";
  sortOrder: "asc" | "desc";
  onSort: (field: keyof Application) => void;
  isBlurred?: boolean;
}

type PrivacyTextVariant = "score" | "company" | "role" | "date" | "table-notes" | "timeline-notes";

interface PrivacyTextProps {
  children: React.ReactNode;
  isPrivate: boolean;
  revealLabel: string;
  title?: string;
  variant: PrivacyTextVariant;
}

function PrivacyText({ children, isPrivate, revealLabel, title, variant }: PrivacyTextProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const isHidden = isPrivate && !isRevealed;

  useEffect(() => {
    setIsRevealed(false);
  }, [isPrivate]);

  const reveal = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
    setIsRevealed(true);
  };

  return (
    <span
      className={`privacy-noise privacy-noise--${variant}${isHidden ? " privacy-noise--active" : ""}`}
      data-private={isHidden ? "true" : undefined}
      onClick={isHidden ? reveal : undefined}
      onKeyDown={isHidden ? (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          reveal(event);
        }
      } : undefined}
      role={isHidden ? "button" : undefined}
      tabIndex={isHidden ? 0 : undefined}
      aria-label={isHidden ? revealLabel : undefined}
      title={isHidden ? undefined : title}
    >
      <span className="privacy-noise__content">{children}</span>
    </span>
  );
}

export function DataTable({ applications, onSelect, sortField, sortOrder, onSort, isBlurred }: DataTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleTimeline = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getScoreInfo = (scoreStr: string) => {
    const score = parseFloat(scoreStr);
    if (isNaN(score)) return { bg: "bg-slate-500/15", text: "text-slate-600 dark:text-slate-400" };
    if (score >= 4.5 || score >= 90) return { bg: "bg-emerald-500/15", text: "text-emerald-600 dark:text-emerald-400" };
    if (score >= 3.5 || score >= 70) return { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-400" };
    return { bg: "bg-slate-500/15", text: "text-slate-600 dark:text-slate-400" };
  };

  const formatScoreDisplay = (scoreStr: string) => {
    const score = parseFloat(scoreStr);
    if (isNaN(score)) return scoreStr.replace(/\s*\/\s*5$/, "");
    return score.toFixed(1);
  };

  const getStatusInfo = (statusStr: string) => {
    const status = (statusStr || "").toUpperCase();
    if (status === "APPLIED" || status === "INTERVIEW" || status === "RESPONDED") return { bg: "bg-primary/15", text: "text-primary" };
    if (status === "SKIP" || status === "REJECTED") return { bg: "bg-error-container/20", text: "text-error" };
    return { bg: "bg-slate-500/15", text: "text-slate-600 dark:text-slate-400" };
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}`;
  };

  const renderSortIndicator = (field: keyof Application) => {
    if (sortField !== field) return "";
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  return (
    <section className="bg-surface-card rounded-xl border border-border-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-surface-container-high text-left">
              <th className="w-[8%] px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider cursor-pointer hover:bg-surface-hover" onClick={() => onSort("score")}>
                Score / 5{renderSortIndicator("score")}
              </th>
              <th className="w-[14%] px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider cursor-pointer hover:bg-surface-hover" onClick={() => onSort("company")}>
                Company{renderSortIndicator("company")}
              </th>
              <th className="w-[16%] px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider cursor-pointer hover:bg-surface-hover" onClick={() => onSort("role")}>
                Role{renderSortIndicator("role")}
              </th>
              <th className="w-[12%] px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider cursor-pointer hover:bg-surface-hover" onClick={() => onSort("status")}>
                Status{renderSortIndicator("status")}
              </th>
              <th className="w-[12%] px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider cursor-pointer hover:bg-surface-hover" onClick={() => onSort("date")}>
                Last Interaction{renderSortIndicator("date")}
              </th>
              <th className="w-[8%] px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Report
              </th>
              <th className="w-[30%] px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Comment
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {applications.map((app) => {
              const scoreClass = getScoreInfo(app.score);
              const statusClass = getStatusInfo(app.status);
              const isExpanded = !!expandedRows[app.num];
              
              return (
                <React.Fragment key={app.num}>
                  <tr 
                    className="hover:bg-surface-hover cursor-pointer transition-colors group" 
                    onClick={(e) => toggleTimeline(e, app.num)}
                  >
                    <td className="px-6 py-5">
                      <PrivacyText
                        isPrivate={!!isBlurred}
                        revealLabel="Reveal score"
                        variant="score"
                      >
                        <span className={`${scoreClass.bg} ${scoreClass.text} px-2.5 py-1 rounded-md text-xs font-bold`}>{formatScoreDisplay(app.score)}</span>
                      </PrivacyText>
                    </td>
                    <td className="px-6 py-5 font-bold text-on-surface">
                      <PrivacyText
                        isPrivate={!!isBlurred}
                        revealLabel="Reveal company"
                        title={app.company}
                        variant="company"
                      >
                        {app.company}
                      </PrivacyText>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant">
                      <PrivacyText
                        isPrivate={!!isBlurred}
                        revealLabel="Reveal role"
                        title={app.role}
                        variant="role"
                      >
                        {app.role}
                      </PrivacyText>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`${statusClass.bg} ${statusClass.text} px-2.5 py-1 rounded-md text-xs font-bold`}>{app.status}</span>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant">
                      <PrivacyText
                        isPrivate={!!isBlurred}
                        revealLabel="Reveal last interaction date"
                        variant="date"
                      >
                        {formatDate(app.date)}
                      </PrivacyText>
                    </td>

                    <td className="px-6 py-5">
                      <button 
                        className="p-2 rounded-full hover:bg-primary/20 text-on-surface-variant hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(app);
                        }}
                      >
                        <span className="material-symbols-outlined text-[20px]" data-icon="visibility">visibility</span>
                      </button>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant text-body-sm">
                      <PrivacyText
                        isPrivate={!!isBlurred}
                        revealLabel="Reveal comment"
                        title={app.notes}
                        variant="table-notes"
                      >
                        {app.notes}
                      </PrivacyText>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-surface-dim">
                      <td className="p-0" colSpan={7}>
                        <div className="px-12 py-8 relative">
                          <div className="timeline-connector"></div>
                          <div className="space-y-8">
                            <div className="relative pl-10">
                              <div className="absolute left-[-2px] top-1.5 w-4 h-4 rounded-full bg-primary/40 ring-4 ring-transparent"></div>
                              <div className="flex flex-col">
                                <div className="text-xs font-label-sm text-on-surface-variant mb-1">
                                  <PrivacyText
                                    isPrivate={!!isBlurred}
                                    revealLabel="Reveal timeline date"
                                    variant="date"
                                  >
                                    {formatDate(app.date)}
                                  </PrivacyText>
                                </div>
                                <h4 className="font-bold text-on-surface mb-1">Status: {app.status}</h4>
                                <div className="text-on-surface-variant text-body-sm max-w-2xl">
                                  <PrivacyText
                                    isPrivate={!!isBlurred}
                                    revealLabel="Reveal timeline comment"
                                    variant="timeline-notes"
                                  >
                                    {app.notes}
                                  </PrivacyText>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>

        </table>
      </div>
    </section>
  );
}
