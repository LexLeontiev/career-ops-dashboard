# Architecture

career-ops-dashboard is a local-first, read-only interface over a local career-ops checkout:

```text
code root + data settings -> config paths -> tracker parser adapter -> Application[]
                 -> Express /api -> React dashboard
                 -> followup-cadence.mjs -> Reminder[] -> reminders widget
                 -> read-only report Markdown -> report drawer
```

`src/server/career-ops-paths.mjs` resolves the code checkout separately from personal data and is shared by the server and `bin/start.sh`. `CAREER_OPS_CODE_ROOT` selects the checkout; a legacy `CAREER_OPS_ROOT` pointing to a checkout remains supported. Data follows upstream's environment overrides, `.career-ops-data` marker, and checkout fallback. `CAREER_OPS_TRACKER` overrides the tracker file. The parser and cadence command remain in the code checkout; tracker and reports follow the resolved data paths.

The parser adapter imports the upstream parser and normalizes rows into `Application[]`. A separate adapter runs the fixed upstream `followup-cadence.mjs` path without a shell, using the code checkout as its working directory and supplying the resolved data root and tracker in its environment. It validates the command's JSON and maps dated entries into `Reminder[]`. Express exposes the normalized data and read-only report Markdown through `/api`; the React dashboard renders the tracker, reminders, and report drawer. Only a missing resolved tracker triggers setup guidance.

The cadence command already reads `applications.md`, the sent follow-up history and date pins in `follow-ups.md`, and the upstream cadence configuration. The dashboard does not merge the history table into reminders or generate reminder text itself.

The application makes no writes to the upstream checkout or its reports. It has no telemetry, authentication, cloud sync, or vendored upstream parser or cadence logic. The default server bind is `127.0.0.1`; changing `HOST` may expose private job-search data to a local network.
