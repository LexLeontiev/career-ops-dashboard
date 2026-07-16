import React, { useState } from "react";

export interface Application {
  num: number;
  date: string;
  company: string;
  via: string;
  role: string;
  score: string;
  status: string;
  report: string;
  notes: string;
}

interface DataTableProps {
  applications: Application[];
  onSelect: (app: Application) => void;
  sortField: keyof Application | "";
  sortOrder: "asc" | "desc";
  onSort: (field: keyof Application) => void;
}

export function DataTable({ applications, onSelect, sortField, sortOrder, onSort }: DataTableProps) {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleTimeline = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getScoreInfo = (scoreStr: string) => {
    const score = parseFloat(scoreStr);
    if (isNaN(score)) return { bg: "bg-[#4b5563]/15", text: "text-[#4b5563]" };
    if (score >= 4.5 || score >= 90) return { bg: "bg-[#10b981]/15", text: "text-[#10b981]" };
    if (score >= 3.5 || score >= 70) return { bg: "bg-[#f59e0b]/15", text: "text-[#f59e0b]" };
    return { bg: "bg-[#4b5563]/15", text: "text-[#4b5563]" };
  };

  const getStatusInfo = (statusStr: string) => {
    const status = (statusStr || "").toUpperCase();
    if (status === "APPLIED" || status === "INTERVIEW" || status === "RESPONDED") return { bg: "bg-primary-container/20", text: "text-primary-fixed-dim" };
    if (status === "SKIP" || status === "REJECTED") return { bg: "bg-error-container/20", text: "text-error" };
    return { bg: "bg-[#9ca3af]/15", text: "text-[#9ca3af]" };
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
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-surface-container-high text-left">
              <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider cursor-pointer hover:bg-white/5" onClick={() => onSort("company")}>
                Company{renderSortIndicator("company")}
              </th>
              <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider cursor-pointer hover:bg-white/5" onClick={() => onSort("role")}>
                Role{renderSortIndicator("role")}
              </th>
              <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider cursor-pointer hover:bg-white/5" onClick={() => onSort("score")}>
                Score / 5{renderSortIndicator("score")}
              </th>
              <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider cursor-pointer hover:bg-white/5" onClick={() => onSort("status")}>
                Status{renderSortIndicator("status")}
              </th>
              <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider cursor-pointer hover:bg-white/5" onClick={() => onSort("date")}>
                Last Interaction{renderSortIndicator("date")}
              </th>
              <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider cursor-pointer hover:bg-white/5" onClick={() => onSort("via")}>
                Added By{renderSortIndicator("via")}
              </th>
              <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Report
              </th>
              <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
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
                    <td className="px-6 py-5 font-bold text-white">{app.company}</td>
                    <td className="px-6 py-5 text-on-surface-variant">{app.role}</td>
                    <td className="px-6 py-5">
                      <span className={`${scoreClass.bg} ${scoreClass.text} px-2.5 py-1 rounded-md text-xs font-bold`}>{app.score.replace(/\s*\/\s*5$/, "")}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`${statusClass.bg} ${statusClass.text} px-2.5 py-1 rounded-md text-xs font-bold`}>{app.status}</span>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant">{formatDate(app.date)}</td>
                    <td className="px-6 py-5 text-on-surface-variant">{app.via}</td>
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
                    <td className="px-6 py-5 text-on-surface-variant text-body-sm">{app.notes}</td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-surface-dim">
                      <td className="p-0" colSpan={8}>
                        <div className="px-12 py-8 relative">
                          <div className="timeline-connector"></div>
                          <div className="space-y-8">
                            <div className="relative pl-10">
                              <div className="absolute left-[-2px] top-1.5 w-4 h-4 rounded-full bg-primary/40 ring-4 ring-transparent"></div>
                              <div className="flex flex-col">
                                <span className="text-xs font-label-sm text-on-surface-variant mb-1">{formatDate(app.date)}</span>
                                <h4 className="font-bold text-white mb-1">Status: {app.status}</h4>
                                <p className="text-on-surface-variant text-body-sm max-w-2xl">{app.notes}</p>
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
