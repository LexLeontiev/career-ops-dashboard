import React from "react";
import { StatsCard } from "./StatsCard.js";
import "./StatsOverview.css";

interface AppData {
  score: string;
  status: string;
  notes?: string;
}

interface StatsOverviewProps {
  readonly applications: AppData[];
}

export function StatsOverview({ applications }: StatsOverviewProps) {
  const total = applications.length;
  let active = 0;
  let applied = 0;
  let interviews = 0;
  let offers = 0;
  let responses = 0;
  let submitted = 0;

  for (const app of applications) {
    const status = (app.status || "").toUpperCase();

    if (status !== "SKIP" && status !== "EVALUATED" && status !== "") {
      submitted++;
      applied++;
      const rejectedWithoutResponse =
        status === "REJECTED" && /\breason\s*:\s*no_response_over_month\b/i.test(app.notes ?? "");
      if (status !== "APPLIED" && !rejectedWithoutResponse) {
        responses++;
      }
    }

    if (status === "APPLIED" || status === "INTERVIEW" || status === "RESPONDED") {
      active++;
    }
    if (status === "INTERVIEW") {
      interviews++;
    }
    if (status === "OFFER" || status === "HIRED") {
      offers++;
    }
  }

  const responseRate = submitted > 0 ? Math.round((responses / submitted) * 100) : 0;
  const hasOffers = offers > 0;

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-gutter mb-stack-lg">
      <StatsCard label="Total Evaluated" value={total} caption="All tracked applications" />
      <StatsCard
        label="Total Applied"
        value={applied}
        caption="All submitted applications"
        valueClassName="text-blue-500 dark:text-blue-300"
      />
      <StatsCard
        label="Active Processes"
        value={active}
        caption="Active application processes"
        valueClassName="text-primary"
      />
      <StatsCard
        label="Interview Stage"
        value={interviews}
        caption="Interviews in progress"
        valueClassName="text-tertiary"
      />
      <StatsCard
        label="Offers"
        value={offers}
        caption="Received offer letters"
        valueClassName={
          hasOffers ? "text-emerald-600 dark:text-emerald-400" : "text-text-secondary"
        }
        achievement={hasOffers}
      />
      <StatsCard
        label="Response Rate"
        value={`${responseRate}%`}
        caption="Responses to applications"
      />
    </section>
  );
}
