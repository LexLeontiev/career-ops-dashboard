import React from "react";

interface StatsCardProps {
  readonly label: string;
  readonly value: number | string;
  readonly caption: string;
  readonly valueClassName?: string;
  readonly achievement?: boolean;
}

export function StatsCard({
  label,
  value,
  caption,
  valueClassName = "text-on-surface",
  achievement = false,
}: StatsCardProps) {
  return (
    <div
      className={`stats-card col-span-1 bg-surface-card p-6 rounded-xl border transition-colors ${achievement ? "stats-card--achievement border-on-surface" : "border-border-subtle hover:border-primary/50"}`}
    >
      <div className="stats-card__header">
        <span className="min-h-[28px] text-text-secondary font-label-sm text-label-sm uppercase">
          {label}
        </span>
      </div>
      <div className={`stats-card__value font-headline-lg text-headline-lg ${valueClassName}`}>
        {value}
      </div>
      <p className="stats-card__caption text-text-secondary text-body-sm">{caption}</p>
    </div>
  );
}
