#!/usr/bin/env bash
set -euo pipefail

pnpm --filter @beagle/db exec prisma generate

pnpm build

if [ "${RUN_DB_MIGRATIONS:-true}" = "true" ]; then
  pnpm db:migrate:deploy
fi
