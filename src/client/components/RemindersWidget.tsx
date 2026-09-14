import React from "react";

export interface ReminderItem {
  date: string;
  company: string;
  notes: string;
}

interface RemindersWidgetProps {
  items: ReminderItem[];
  hasError?: boolean;
  today?: Date;
  isBlurred: boolean;
}

function localNoon(date: string | Date): Date {
  if (date instanceof Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  }
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function dateKey(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDateLabel(value: string, today: Date): string {
  const date = localNoon(value);
  const difference = Math.round((dateKey(date) - dateKey(today)) / 86_400_000);
  const relative =
    difference === -1
      ? "Yesterday"
      : difference === 0
        ? "Today"
        : difference === 1
          ? "Tomorrow"
          : null;
  const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    date,
  );
  if (relative) return `${relative} · ${monthDay}`;
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  return `${weekday} · ${monthDay}`;
}

function formatNotes(notes: string): string {
  const characters = Array.from(notes);
  return characters.length <= 140 ? notes : `…${characters.slice(-140).join("")}`;
}

function PrivacyText({
  children,
  variant,
  isBlurred,
}: {
  children: React.ReactNode;
  variant: "company" | "timeline-notes";
  isBlurred: boolean;
}) {
  return (
    <span
      className={`privacy-noise privacy-noise--${variant}${isBlurred ? " privacy-noise--active" : ""}`}
    >
      <span className="privacy-noise__content">{children}</span>
    </span>
  );
}

export function RemindersWidget({
  items,
  hasError = false,
  today = new Date(),
  isBlurred,
}: RemindersWidgetProps) {
  const sortedItems = [...items].sort(
    (a, b) => localNoon(a.date).getTime() - localNoon(b.date).getTime(),
  );
  const [scrollbar, setScrollbar] = React.useState({ visible: false, offset: 0, size: 100 });
  const hideScrollbarTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const revealScrollbar = (event: React.UIEvent<HTMLUListElement>) => {
    const { clientHeight, scrollHeight, scrollTop } = event.currentTarget;
    const maxScroll = Math.max(scrollHeight - clientHeight, 0);
    const size = scrollHeight > 0 ? Math.max((clientHeight / scrollHeight) * 100, 10) : 100;
    const offset = maxScroll > 0 ? (scrollTop / maxScroll) * (100 - size) : 0;

    setScrollbar({ visible: true, offset, size });
    if (hideScrollbarTimer.current) clearTimeout(hideScrollbarTimer.current);
    hideScrollbarTimer.current = setTimeout(
      () => setScrollbar((current) => ({ ...current, visible: false })),
      900,
    );
  };

  React.useEffect(
    () => () => {
      if (hideScrollbarTimer.current) clearTimeout(hideScrollbarTimer.current);
    },
    [],
  );

  return (
    <section
      className="h-[17rem] flex flex-col rounded-xl border border-border-subtle bg-surface-card p-4 md:p-6"
      aria-label="Reminders"
      role="region"
    >
      <div className="mb-stack-md flex items-baseline justify-between gap-4">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">
          Reminders ({sortedItems.length})
        </h2>
      </div>
      {hasError ? (
        <p className="flex flex-1 items-center justify-center text-sm text-text-secondary">
          Reminders unavailable.
        </p>
      ) : sortedItems.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-sm text-text-secondary">
          No reminders scheduled.
        </p>
      ) : (
        <div className="relative min-h-0 flex-1">
          <ul
            className="scrollbar-autohide h-full space-y-2 overflow-y-auto"
            aria-label="Reminders list"
            onScroll={revealScrollbar}
          >
            {sortedItems.map((item, index) => (
              <li
                key={`${item.date}-${item.company}-${index}`}
                className="rounded-lg bg-surface-container px-3 py-2 text-sm"
              >
                <div className="text-xs text-text-secondary">
                  {formatDateLabel(item.date, today)}
                </div>
                <div className="font-medium text-on-surface">
                  <PrivacyText variant="company" isBlurred={isBlurred}>
                    {item.company}
                  </PrivacyText>
                </div>
                <div className="text-xs text-text-secondary">
                  <PrivacyText variant="timeline-notes" isBlurred={isBlurred}>
                    {formatNotes(item.notes)}
                  </PrivacyText>
                </div>
              </li>
            ))}
          </ul>
          {scrollbar.visible && (
            <span
              aria-hidden="true"
              className="overlay-scrollbar overlay-scrollbar--vertical"
              style={{ top: `${scrollbar.offset}%`, height: `${scrollbar.size}%` }}
            />
          )}
        </div>
      )}
    </section>
  );
}
