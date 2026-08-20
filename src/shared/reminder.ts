export type ReminderUrgency = "urgent" | "overdue" | "waiting" | "cold";

export interface Reminder {
  appNum: number;
  date: string;
  company: string;
  notes: string;
  urgency: ReminderUrgency;
}

const urgencyValues = new Set<ReminderUrgency>(["urgent", "overdue", "waiting", "cold"]);

function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

function isUrgency(value: unknown): value is ReminderUrgency {
  return typeof value === "string" && urgencyValues.has(value as ReminderUrgency);
}

function isReminder(value: unknown): value is Reminder {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    Number.isInteger(candidate.appNum) &&
    (candidate.appNum as number) > 0 &&
    typeof candidate.date === "string" &&
    isCalendarDate(candidate.date) &&
    typeof candidate.company === "string" &&
    candidate.company.trim() !== "" &&
    typeof candidate.notes === "string" &&
    isUrgency(candidate.urgency)
  );
}

export function parseFollowUpCadence(value: unknown): Reminder[] {
  if (typeof value !== "object" || value === null || !("entries" in value)) {
    throw new TypeError("Invalid follow-up cadence output");
  }

  const entries = (value as Record<string, unknown>).entries;
  if (!Array.isArray(entries)) throw new TypeError("Invalid follow-up cadence output");

  const reminders: Reminder[] = [];
  for (const entry of entries) {
    if (typeof entry !== "object" || entry === null) {
      throw new TypeError("Invalid follow-up cadence output");
    }
    const candidate = entry as Record<string, unknown>;
    const nextDate = candidate.nextFollowupDate;
    const validEntry =
      Number.isInteger(candidate.num) &&
      (candidate.num as number) > 0 &&
      typeof candidate.company === "string" &&
      candidate.company.trim() !== "" &&
      typeof candidate.notes === "string" &&
      isUrgency(candidate.urgency) &&
      (nextDate === null || (typeof nextDate === "string" && isCalendarDate(nextDate)));
    if (!validEntry) throw new TypeError("Invalid follow-up cadence output");
    if (nextDate === null) continue;

    reminders.push({
      appNum: candidate.num as number,
      date: nextDate as string,
      company: candidate.company as string,
      notes: candidate.notes as string,
      urgency: candidate.urgency as ReminderUrgency,
    });
  }
  return reminders;
}

export function parseRemindersPayload(value: unknown): Reminder[] {
  if (!Array.isArray(value) || !value.every(isReminder)) {
    throw new TypeError("Invalid reminders response");
  }
  return value;
}
