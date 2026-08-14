export function resolveColumns() {
  return {};
}

export function parseTrackerRow(line) {
  const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
  if (!/^\d+$/.test(cells[0] ?? "")) return null;
  const [num, date, company, role, score, status, pdf, report, notes] = cells;
  return { num: Number(num), date, company, role, score, status, pdf, report, notes };
}
