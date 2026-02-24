#!/usr/bin/env bash
set -euo pipefail

# Ensure commands resolve against workspace root even when invoked from apps/web.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

pnpm --filter @beagle/db exec prisma generate

pnpm build

if [ "${RUN_DB_MIGRATIONS:-true}" = "true" ]; then
  pnpm db:migrate:deploy
fi
