import type { Application } from "../shared/application.js";

export type ActivityDateStrategy = (application: Application) => string[];

export const trackerDateStrategy: ActivityDateStrategy = (application) => [application.date];

export const trackerAndNotesDateStrategy: ActivityDateStrategy = (application) => [
  ...trackerDateStrategy(application),
  ...(application.notes.match(/\b\d{4}-\d{2}-\d{2}\b/g) ?? []),
];

export interface ActivityDay {
  date: string;
  count: number;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function subtractCalendarMonths(date: Date, months: number): Date {
  const rawMonth = date.getMonth() - months;
  const year = date.getFullYear() + Math.floor(rawMonth / 12);
  const month = ((rawMonth % 12) + 12) % 12;
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(date.getDate(), lastDay), 12);
}

export function buildActivityDays(
  applications: Application[],
  strategy: ActivityDateStrategy,
  todayDate: Date,
): ActivityDay[] {
  const companiesByDate = new Map<string, Set<string>>();
  const todayAtNoon = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth(),
    todayDate.getDate(),
    12,
  );
  const startAtNoon = subtractCalendarMonths(todayAtNoon, 6);
  const start = formatLocalDate(startAtNoon);
  const today = formatLocalDate(todayAtNoon);

  for (const application of applications) {
    for (const date of new Set(strategy(application))) {
      if (date < start || date > today) continue;
      const companies = companiesByDate.get(date) ?? new Set<string>();
      companies.add(application.company);
      companiesByDate.set(date, companies);
    }
  }

  const days: ActivityDay[] = [];
  for (
    const cursor = new Date(startAtNoon);
    cursor <= todayAtNoon;
    cursor.setDate(cursor.getDate() + 1)
  ) {
    const date = formatLocalDate(cursor);
    days.push({ date, count: companiesByDate.get(date)?.size ?? 0 });
  }
  return days;
}
