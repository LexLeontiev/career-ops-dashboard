import React from "react";
import { createPortal } from "react-dom";
import type { ActivityDay } from "../activity.js";

const dateLabelFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});
const monthLabelFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
const tooltipDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

const intensityClasses = [
  "bg-surface-container-high",
  "bg-primary/20",
  "bg-primary/40",
  "bg-primary/70",
  "bg-primary",
] as const;

function parseDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function activityLabel(day: ActivityDay): string {
  const interaction = day.count === 1 ? "interaction" : "interactions";
  return `${dateLabelFormatter.format(parseDate(day.date))}: ${day.count} ${interaction}`;
}

function tooltipLabel(day: ActivityDay): string {
  const action = day.count === 1 ? "action" : "actions";
  return `${tooltipDateFormatter.format(parseDate(day.date))} · ${day.count} ${action}`;
}

function buildCalendarCells(days: ActivityDay[]): Array<ActivityDay | null> {
  const firstDay = days[0];
  if (!firstDay) return [];
  const mondayBasedWeekday = (parseDate(firstDay.date).getDay() + 6) % 7;
  const cells = [...Array<ActivityDay | null>(mondayBasedWeekday).fill(null), ...days];
  const remainingWeekdays = (7 - (cells.length % 7)) % 7;
  return [...cells, ...Array<ActivityDay | null>(remainingWeekdays).fill(null)];
}

function buildMonthLabels(cells: Array<ActivityDay | null>): string[] {
  const labels: string[] = [];
  const firstVisibleDay = cells.find((day): day is ActivityDay => day !== null);
  if (!firstVisibleDay) return labels;
  const firstVisibleDate = parseDate(firstVisibleDay.date);
  let previousMonth = -1;

  for (let index = 0; index < cells.length; index += 7) {
    let label = "";
    for (const day of cells.slice(index, index + 7)) {
      if (!day) continue;
      const date = parseDate(day.date);
      if (date.getMonth() !== previousMonth) {
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1, 12);
        if (monthStart >= firstVisibleDate) {
          label ||= monthLabelFormatter.format(date);
        }
        previousMonth = date.getMonth();
      }
    }
    labels.push(label);
  }

  return labels;
}

export function ActivityHeatmap({ days }: { days: ActivityDay[] }) {
  const cells = buildCalendarCells(days);
  const monthLabels = buildMonthLabels(cells);
  type TooltipState = {
    day: ActivityDay;
    left: number;
    top: number;
  };
  const [hoveredTooltip, setHoveredTooltip] = React.useState<TooltipState | null>(null);
  const [focusedTooltip, setFocusedTooltip] = React.useState<TooltipState | null>(null);
  const tooltip = hoveredTooltip ?? focusedTooltip;

  const buildTooltip = (element: HTMLElement, day: ActivityDay): TooltipState => {
    const bounds = element.getBoundingClientRect();
    return {
      day,
      left: bounds.left + bounds.width / 2,
      top: bounds.top - 8,
    };
  };

  return (
    <section
      aria-labelledby="activity-title"
      className="mb-stack-lg w-fit max-w-full rounded-xl border border-border-subtle bg-surface-card p-4 md:p-6"
    >
      <div className="mb-stack-md flex items-baseline justify-between gap-4">
        <h2 id="activity-title" className="font-headline-sm text-headline-sm text-on-surface">
          Activity
        </h2>
        <span className="font-label-sm text-label-sm text-on-surface-variant">Last 6 months</span>
      </div>

      <div
        role="region"
        aria-label="Activity calendar"
        tabIndex={0}
        className="overflow-x-auto pb-2"
      >
        <div className="min-w-max">
          <div className="mb-2 ml-8 grid grid-flow-col auto-cols-[0.75rem] gap-1 text-[10px] text-on-surface-variant">
            {monthLabels.map((label, index) => (
              <span key={`${label}-${index}`} className="h-3 whitespace-nowrap">
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <div
              aria-hidden="true"
              className="grid w-6 grid-rows-7 gap-1 text-[10px] leading-3 text-on-surface-variant"
            >
              <span>Mon</span>
              <span />
              <span>Wed</span>
              <span />
              <span>Fri</span>
              <span />
              <span />
            </div>

            <div
              role="group"
              aria-label="Daily activity grid"
              className="grid grid-flow-col grid-rows-7 auto-cols-[0.75rem] gap-1"
            >
              {cells.map((day, index) => {
                if (!day) {
                  return (
                    <span
                      key={`empty-${index}`}
                      aria-hidden="true"
                      className="h-3 w-3 rounded-[3px] border border-border-subtle/30 bg-surface-container-high/40"
                    />
                  );
                }
                const label = activityLabel(day);
                const tooltipId = `activity-tooltip-${day.date}`;
                const tooltipVisible = tooltip?.day.date === day.date;
                return (
                  <time
                    key={day.date}
                    role="img"
                    dateTime={day.date}
                    aria-label={label}
                    aria-describedby={tooltipVisible ? tooltipId : undefined}
                    tabIndex={0}
                    onMouseEnter={(event) =>
                      setHoveredTooltip(buildTooltip(event.currentTarget, day))
                    }
                    onMouseLeave={() => setHoveredTooltip(null)}
                    onFocus={(event) => setFocusedTooltip(buildTooltip(event.currentTarget, day))}
                    onBlur={() => setFocusedTooltip(null)}
                    className={`h-3 w-3 rounded-[3px] border border-border-subtle/50 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card ${intensityClasses[Math.min(day.count, 4)]}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        aria-label="Activity intensity: less to more"
        className="mt-stack-sm flex items-center justify-end gap-1.5 font-label-sm text-label-sm text-on-surface-variant"
      >
        <span>Less</span>
        {intensityClasses.map((className) => (
          <span
            key={className}
            aria-hidden="true"
            className={`h-3 w-3 rounded-[3px] border border-border-subtle/50 ${className}`}
          />
        ))}
        <span>More</span>
      </div>

      {tooltip &&
        createPortal(
          <span
            id={`activity-tooltip-${tooltip.day.date}`}
            role="tooltip"
            style={{ left: tooltip.left, top: tooltip.top }}
            className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-border-subtle bg-surface-container-high px-2 py-1 text-xs font-medium text-on-surface shadow-lg"
          >
            {tooltipLabel(tooltip.day)}
          </span>,
          document.body,
        )}
    </section>
  );
}
