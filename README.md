# career-ops-dashboard

[![CI](https://github.com/LexLeontiev/career-ops-dashboard/actions/workflows/ci.yml/badge.svg)](https://github.com/LexLeontiev/career-ops-dashboard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Unofficial community UI — not affiliated with or endorsed by career-ops or its maintainers.

career-ops-dashboard is a local-first React and Express dashboard for viewing application-tracker data and Markdown reports from a local [career-ops](https://github.com/santifer/career-ops) checkout. It reads upstream data without changing it, keeps data on your machine, and binds to localhost by default.

![Dashboard preview](docs/assets/dashboard-preview.png)

## Features

- Browse, filter, and sort applications from the upstream tracker.
- Open read-only Markdown reports in an accessible drawer.
- Use the privacy mode to obscure visible application details on demand.
- Choose light or dark appearance locally in the browser.

## Privacy and security

The dashboard reads data only from your local career-ops checkout. It does not write to upstream files, send telemetry, require authentication, or sync data to the cloud. Keep resumes, trackers, reports, and credentials out of issues, pull requests, and screenshots.

The server binds to `127.0.0.1` by default. Changing `HOST` may expose private job-search data to your local network.

## Requirements

- Node.js 22.13 or newer; CI runs on Node 22 and 24.
- macOS or Linux. Windows is supported through WSL only.
- Git and a local clone of [career-ops](https://github.com/santifer/career-ops).

## Quick start

Initialize career-ops first:

```bash
npx @santifer/career-ops init
cd career-ops
codex # or claude
```

Complete the first-run onboarding in your AI CLI. It creates `data/applications.md`, which the dashboard reads as its tracker. Then exit the CLI and install the dashboard beside the career-ops directory:

```bash
cd ..
git clone https://github.com/LexLeontiev/career-ops-dashboard.git
cd career-ops-dashboard
bash bin/start.sh
```

The start script expects the two directories to be side by side. Open the local address printed by the server when startup completes.

If you start the dashboard before onboarding is complete, it shows a link to the official [career-ops Quick Start](https://github.com/santifer/career-ops#quick-start). The dashboard remains read-only and never creates or modifies the tracker itself.

## Configuration

| Variable          | Default         | Purpose                                                                                                        |
| ----------------- | --------------- | -------------------------------------------------------------------------------------------------------------- |
| `CAREER_OPS_ROOT` | `../career-ops` | Path to the local career-ops checkout.                                                                         |
| `HOST`            | `127.0.0.1`     | Address on which the API server listens. Changing it may expose private job-search data to your local network. |
| `PORT`            | `3001`          | API server port.                                                                                               |

For a non-default upstream location:

```bash
CAREER_OPS_ROOT=/path/to/career-ops bash bin/start.sh
```

## Development

Install dependencies and run the development server:

```bash
npm ci
npm run dev
```

Run the test suite and the complete local quality gate before opening a pull request:

```bash
npm test
npm run check
```

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the data flow, read-only boundary, and component responsibilities.

## Troubleshooting

- If startup cannot find the upstream checkout, set `CAREER_OPS_ROOT` to its local path.
- If port `3001` is unavailable, start with another port: `PORT=3002 npm run dev`.
- If `data/applications.md` is absent, open your AI CLI in the career-ops directory and complete first-run onboarding.
- If the tracker parser or `reports/` directory is absent, update your local career-ops checkout before starting the dashboard.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and agree to the [Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request.

## Security

See [SECURITY.md](SECURITY.md) for supported versions and private vulnerability-reporting channels.

## Upstream compatibility

The canonical upstream is [santifer/career-ops](https://github.com/santifer/career-ops). This dashboard uses its tracker parser through a local adapter and never vendors or modifies the upstream parser. Compatibility depends on the documented upstream tracker layout; report breakage with synthetic reproduction data only.

## License

This project is licensed under the [MIT License](LICENSE).
