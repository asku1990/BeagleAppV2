#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "" ]; then
  echo "Usage: $0 <dump-file.sql>"
  exit 1
fi

if [ "${2:-}" != "" ]; then
  echo "Usage: $0 <dump-file.sql>"
  echo "Do not pass env file as an argument."
  echo "Use: pass-cli run --env-file .env.staging -- pnpm db:restore <dump-file.sql>"
  exit 1
fi

dump_file="$1"

if [ ! -f "$dump_file" ]; then
  echo "Dump file not found: $dump_file"
  exit 1
fi

if [[ "$(basename "$dump_file")" == .env* ]]; then
  echo "Refusing to restore from env file path: $dump_file"
  echo "Use: pass-cli run --env-file .env.staging -- pnpm db:restore <dump-file.sql>"
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Shared DB target safety checks used by dump + restore.
source "$script_dir/env-guard.sh"
ensure_database_url_set
ensure_db_operation_allowed "database restore"
ensure_binary_available "psql"

psql -v ON_ERROR_STOP=1 "$DATABASE_URL" < "$dump_file"

echo "Restore completed from: $dump_file"
