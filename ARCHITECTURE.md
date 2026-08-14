# Architecture

career-ops-dashboard is a local-first, read-only interface over a local career-ops checkout:

```text
CAREER_OPS_ROOT -> config paths -> tracker parser adapter -> Application[]
                 -> Express /api -> React dashboard
                 -> read-only report Markdown -> report drawer
```

`CAREER_OPS_ROOT` resolves the upstream checkout and its expected tracker, reports, and parser paths. The parser adapter imports the upstream parser and normalizes rows into `Application[]`; Express exposes that data and read-only report Markdown through `/api`; the React dashboard renders the tracker and report drawer.

The application makes no writes to the upstream checkout or its reports. It has no telemetry, authentication, cloud sync, or vendored upstream parser. The default server bind is `127.0.0.1`; changing `HOST` may expose private job-search data to a local network.
