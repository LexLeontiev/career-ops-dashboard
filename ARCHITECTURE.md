# Architecture

career-ops-dashboard is a local-first, read-only interface over a local career-ops checkout:

```text
CAREER_OPS_ROOT -> config paths -> tracker parser adapter -> Application[]
                 -> Express /api -> React dashboard
                 -> followup-cadence.mjs -> Reminder[] -> reminders widget
                 -> read-only report Markdown -> report drawer
```

`CAREER_OPS_ROOT` resolves the upstream checkout and its expected tracker, reports, parser, and cadence-command paths. The parser adapter imports the upstream parser and normalizes rows into `Application[]`. A separate adapter runs the fixed upstream `followup-cadence.mjs` path without a shell, validates its JSON, and maps dated entries into `Reminder[]`. Express exposes the normalized data and read-only report Markdown through `/api`; the React dashboard renders the tracker, reminders, and report drawer.

The cadence command already reads `applications.md`, the sent follow-up history and date pins in `follow-ups.md`, and the upstream cadence configuration. The dashboard does not merge the history table into reminders or generate reminder text itself.

The application makes no writes to the upstream checkout or its reports. It has no telemetry, authentication, cloud sync, or vendored upstream parser or cadence logic. The default server bind is `127.0.0.1`; changing `HOST` may expose private job-search data to a local network.
