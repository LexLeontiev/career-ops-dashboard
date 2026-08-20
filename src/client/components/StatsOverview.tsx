import React from "react";

interface AppData {
  score: string;
  status: string;
}

export function StatsOverview({ applications }: { applications: AppData[] }) {
  const total = applications.length;
  let active = 0;
  let interviews = 0;
  let offers = 0;
  let responses = 0;
  let submitted = 0;

  for (const app of applications) {
    const status = (app.status || "").toUpperCase();

    if (status !== "SKIP" && status !== "EVALUATED" && status !== "") {
      submitted++;
      if (status !== "APPLIED") {
        responses++;
      }
    }

    if (status === "APPLIED" || status === "INTERVIEW" || status === "RESPONDED") {
      active++;
    }
    if (status === "INTERVIEW") {
      interviews++;
    }
    if (status === "OFFER") {
      offers++;
    }
  }

  const responseRate = submitted > 0 ? Math.round((responses / submitted) * 100) : 0;
  const hasOffers = offers > 0;

  return (
    <section className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-5 gap-gutter mb-stack-lg">
      <div className="col-span-1 md:col-span-3 lg:col-span-1 bg-surface-card p-6 rounded-xl border border-border-subtle hover:border-primary/50 transition-colors">
        <div className="text-text-secondary font-label-sm text-label-sm uppercase mb-2">
          Total Applications
        </div>
        <div className="text-on-surface font-headline-lg text-headline-lg">{total}</div>
      </div>
      <div className="col-span-1 md:col-span-3 lg:col-span-1 bg-surface-card p-6 rounded-xl border border-border-subtle hover:border-primary/50 transition-colors">
        <div className="text-text-secondary font-label-sm text-label-sm uppercase mb-2">
          Active Processes
        </div>
        <div className="text-primary font-headline-lg text-headline-lg">{active}</div>
      </div>
      <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-surface-card p-6 rounded-xl border border-border-subtle hover:border-primary/50 transition-colors">
        <div className="text-text-secondary font-label-sm text-label-sm uppercase mb-2">
          Interview Stage
        </div>
        <div className="text-secondary font-headline-lg text-headline-lg">{interviews}</div>
      </div>
      <div
        className={`col-span-1 md:col-span-2 lg:col-span-1 bg-surface-card p-6 rounded-xl border transition-colors ${
          hasOffers
            ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-600 dark:hover:border-emerald-400"
            : "border-border-subtle hover:border-primary/50"
        }`}
      >
        <div className="text-text-secondary font-label-sm text-label-sm uppercase mb-2">Offers</div>
        <div
          className={`font-headline-lg text-headline-lg ${hasOffers ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-text-secondary"}`}
        >
          {offers}
        </div>
      </div>
      <div className="col-span-2 md:col-span-2 lg:col-span-1 bg-surface-card p-6 rounded-xl border border-border-subtle hover:border-primary/50 transition-colors">
        <div className="text-text-secondary font-label-sm text-label-sm uppercase mb-2">
          Response Rate
        </div>
        <div className="text-tertiary font-headline-lg text-headline-lg">{responseRate}%</div>
      </div>
    </section>
  );
}
