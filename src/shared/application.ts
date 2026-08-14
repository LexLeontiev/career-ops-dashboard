export interface Application {
  num: number;
  date: string;
  company: string;
  via: string;
  role: string;
  score: string;
  status: string;
  pdf: string;
  report: string;
  notes: string;
}

const stringFields = [
  "date",
  "company",
  "via",
  "role",
  "score",
  "status",
  "pdf",
  "report",
  "notes",
] as const;

export function isApplication(value: unknown): value is Application {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.num === "number" &&
    Number.isFinite(candidate.num) &&
    stringFields.every((field) => typeof candidate[field] === "string")
  );
}

export function parseApplicationsPayload(value: unknown): Application[] {
  if (!Array.isArray(value) || !value.every(isApplication)) {
    throw new TypeError("Invalid applications response");
  }
  return value;
}
