#!/usr/bin/env bash
# career-ops-dashboard — local start script
#
# Checks dependencies, installs them if needed, and starts the server.
# Assumes career-ops is checked out side-by-side by default.

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
PROJECT_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd -P)"
cd "$PROJECT_ROOT"
CAREER_OPS_ROOT="${CAREER_OPS_ROOT:-$PROJECT_ROOT/../career-ops}"

bold()  { printf "\033[1m%s\033[0m\n" "$1"; }
green() { printf "\033[32m%s\033[0m\n" "$1"; }
red()   { printf "\033[31m%s\033[0m\n" "$1"; }
dim()   { printf "\033[2m%s\033[0m\n" "$1"; }

if [[ $# -gt 1 ]] || [[ $# -eq 1 && "$1" != "--check" ]]; then
  red "  error: unsupported arguments."
  dim "  Usage: bash bin/start.sh [--check]"
  exit 2
fi

bold "  career-ops-dashboard — setup & start"
bold "  ──────────────────────────────────────"

# 1. Check Node and NPM
if ! command -v node >/dev/null 2>&1; then
  red "  error: 'node' is required but not installed."
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  red "  error: 'npm' is required but not installed."
  exit 1
fi

read -r NODE_MAJOR NODE_MINOR < <(
  node -p "process.versions.node.split('.').slice(0, 2).join(' ')"
)
if (( NODE_MAJOR < 22 || (NODE_MAJOR == 22 && NODE_MINOR < 13) )); then
  red "  error: Node.js >= 22.13 required (found $(node -v))"
  exit 1
fi
green "  ✓ Node $(node -v), npm $(npm -v)"

# 2. Check for career-ops repository
if [ ! -d "$CAREER_OPS_ROOT" ]; then
  echo ""
  red "  error: career-ops repository not found at '$CAREER_OPS_ROOT'."
  dim "  This dashboard is designed to run side-by-side with the career-ops CLI."
  dim "  Please clone it first:"
  dim "    git clone https://github.com/santifer/career-ops.git $CAREER_OPS_ROOT"
  echo ""
  dim "  Or if it's located elsewhere, set the CAREER_OPS_ROOT environment variable:"
  dim "    CAREER_OPS_ROOT=/path/to/career-ops bash bin/start.sh"
  exit 1
fi

if [ ! -f "$CAREER_OPS_ROOT/data/applications.md" ]; then
  dim "  ⚠ Tracker not initialized yet; dashboard will show setup guidance."
fi
if [ ! -d "$CAREER_OPS_ROOT/reports" ]; then
  red "  error: career-ops is missing reports at '$CAREER_OPS_ROOT'."
  exit 1
fi
if [ ! -f "$CAREER_OPS_ROOT/tracker-parse.mjs" ]; then
  red "  error: career-ops is missing tracker-parse.mjs at '$CAREER_OPS_ROOT'."
  exit 1
fi
green "  ✓ Found career-ops at $CAREER_OPS_ROOT"

if [[ "${1:-}" == "--check" ]]; then
  green "  ✓ Environment check passed"
  exit 0
fi

# 3. Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
  green "  → Installing npm dependencies..."
  npm ci --no-audit --no-fund
else
  green "  ✓ npm dependencies installed"
fi

# 4. Start the server
echo ""
bold "  Starting career-ops-dashboard..."
exec env CAREER_OPS_ROOT="$CAREER_OPS_ROOT" npm run dev
