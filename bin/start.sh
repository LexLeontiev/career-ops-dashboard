#!/usr/bin/env bash
# career-ops-dashboard — local start script
#
# Checks dependencies, installs them if needed, and starts the server.
# Assumes career-ops is checked out side-by-side by default.

set -euo pipefail

CAREER_OPS_ROOT="${CAREER_OPS_ROOT:-../career-ops}"

bold()  { printf "\033[1m%s\033[0m\n" "$1"; }
green() { printf "\033[32m%s\033[0m\n" "$1"; }
red()   { printf "\033[31m%s\033[0m\n" "$1"; }
dim()   { printf "\033[2m%s\033[0m\n" "$1"; }

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

NODE_MAJOR=$(node -p "parseInt(process.versions.node, 10)")
if [ "$NODE_MAJOR" -lt 18 ]; then
  red "  error: Node.js >= 18 required (found $(node -v))"
  exit 1
fi
green "  ✓ Node $(node -v), npm $(npm -v)"

# 2. Check for career-ops repository
if [ ! -d "$CAREER_OPS_ROOT" ]; then
  echo ""
  red "  error: career-ops repository not found at '$CAREER_OPS_ROOT'."
  dim "  This dashboard is designed to run side-by-side with the career-ops CLI."
  dim "  Please clone it first:"
  dim "    git clone https://github.com/Fighter90/career-ops.git $CAREER_OPS_ROOT"
  echo ""
  dim "  Or if it's located elsewhere, set the CAREER_OPS_ROOT environment variable:"
  dim "    CAREER_OPS_ROOT=/path/to/career-ops bash bin/start.sh"
  exit 1
fi
green "  ✓ Found career-ops at $CAREER_OPS_ROOT"

# 3. Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
  green "  → Installing npm dependencies..."
  npm install --no-audit --no-fund
else
  green "  ✓ npm dependencies installed"
fi

# 4. Start the server
echo ""
bold "  Starting career-ops-dashboard..."
exec env CAREER_OPS_ROOT="$CAREER_OPS_ROOT" npm run dev
