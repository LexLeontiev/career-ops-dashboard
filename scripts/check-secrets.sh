#!/usr/bin/env bash
set -euo pipefail

pattern='(AIza[0-9A-Za-z_-]{30,}|gh[pousr]_[0-9A-Za-z]{30,}|sk-[0-9A-Za-z_-]{20,}|-----BEGIN (RSA|OPENSSH|EC) PRIVATE KEY-----|/Users/[0-9A-Za-z._-]+/)'

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  if git grep -nEI "$pattern" -- . ':!scripts/check-secrets.sh'; then
    printf 'Potential secret or private path found in tracked files.\n' >&2
    exit 1
  fi

  if git log -p --all -- . ':!scripts/check-secrets.sh' | grep -nE "$pattern"; then
    printf 'Potential secret or private path found in tracked history.\n' >&2
    exit 1
  fi
else
  if grep -RInE "$pattern" . \
    --exclude=check-secrets.sh \
    --exclude-dir=node_modules \
    --exclude-dir=dist \
    --exclude-dir=coverage; then
    printf 'Potential secret or private path found in release files.\n' >&2
    exit 1
  fi
fi

printf 'Tracked files and history secret scan passed.\n'
