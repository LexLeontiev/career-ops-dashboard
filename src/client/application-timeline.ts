import type { Application } from "../shared/application.js";

export interface ApplicationTimelineEntry {
  date: string;
  status: string;
  comment: string;
}

type TimelineApplication = Pick<Application, "date" | "status" | "notes">;

interface TaggedEntry extends ApplicationTimelineEntry {
  sourceIndex: number;
}

function isValidIsoDate(value: string): boolean {
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function buildApplicationTimeline(
  application: TimelineApplication,
): ApplicationTimelineEntry[] {
  const tagPattern = /\[(\d{4}-\d{2}-\d{2})·([^\]\r\n]*)\]/g;
  const matches = [...application.notes.matchAll(tagPattern)];
  const hasInvalidTag = matches.some(
    (match) => !isValidIsoDate(match[1]) || match[2].trim().length === 0,
  );
  const hasLegacyPreamble =
    matches.length > 0 && application.notes.slice(0, matches[0].index).trim().length > 0;

  if (matches.length === 0 || hasInvalidTag || hasLegacyPreamble) {
    return [
      {
        date: application.date,
        status: application.status,
        comment: application.notes,
      },
    ];
  }

  const entries: TaggedEntry[] = matches.map((match, index) => {
    const sourceIndex = match.index;
    const nextSourceIndex = matches[index + 1]?.index ?? application.notes.length;
    const taggedComment = application.notes
      .slice(sourceIndex + match[0].length, nextSourceIndex)
      .trim();

    return {
      date: match[1].trim(),
      status: match[2].trim(),
      comment: taggedComment,
      sourceIndex,
    };
  });

  return entries
    .sort(
      (left, right) => right.date.localeCompare(left.date) || right.sourceIndex - left.sourceIndex,
    )
    .map(({ date, status, comment }) => ({ date, status, comment }));
}
