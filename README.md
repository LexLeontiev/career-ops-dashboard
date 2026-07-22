# career-ops-dashboard

> A clean, docs-style web interface for the [career-ops](https://github.com/Fighter90/career-ops) AI job-search pipeline.

This project is a web UI companion for `career-ops`. It allows you to search, evaluate, and track your job applications through a dashboard while relying on the underlying `career-ops` data files.

*Disclaimer: This project is not affiliated with or endorsed by career-ops. All official documentation for career-ops can be found at [career-ops.org/docs](https://career-ops.org/docs).*

## Requirements

- **Node.js** >= 18
- **Git**
- The original [career-ops](https://github.com/Fighter90/career-ops) repository.

## Quick Start

`career-ops-dashboard` is designed to run locally alongside your existing `career-ops` CLI project. 

### 1. Workspace Structure
Your workspace should look like this:
```text
workspace/
├── career-ops/             <- Original CLI
└── career-ops-dashboard/   <- This project
```

### 2. Download and Run

Clone this repository next to your `career-ops` folder and run the start script. It will automatically check your environment, install NPM dependencies, and start the local server.

```bash
git clone https://github.com/your-username/career-ops-dashboard.git
cd career-ops-dashboard
bash bin/start.sh
```

## Configuration

By default, the dashboard looks for your `career-ops` data in the `../career-ops` directory. 
If your `career-ops` folder is located elsewhere, you can override this path by setting the `CAREER_OPS_ROOT` environment variable before running the script:

```bash
CAREER_OPS_ROOT=/absolute/path/to/your/career-ops bash bin/start.sh
```
