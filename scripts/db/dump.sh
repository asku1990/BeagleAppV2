#!/usr/bin/env bash
set -euo pipefail

output_file="${1:-}"

if [ "${1:-}" != "" ] && [ "${2:-}" != "" ]; then
  echo "Usage: $0 [output-file.sql]"
  echo "Do not pass env file as an argument."
  echo "Use: pass-cli run --env-file .env.local -- pnpm db:dump [output-file.sql]"
  exit 1
fi

if [ -n "$output_file" ] && [[ "$(basename "$output_file")" == .env* ]]; then
  echo "Refusing to use '$output_file' as dump output path."
  echo "Do not pass env file as an argument."
  echo "Use: pass-cli run --env-file .env.local -- pnpm db:dump [output-file.sql]"
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Shared DB target safety checks used by dump + restore.
source "$script_dir/env-guard.sh"
ensure_database_url_set
ensure_db_operation_allowed "database dump"
ensure_binary_available "pg_dump"

env_name="$(infer_db_env_label)"

timestamp="$(date +%Y%m%d-%H%M%S)"
if [ -z "$output_file" ]; then
  dump_date="$(date +%Y-%m-%d)"
  output_file="./tmp/db-dumps/${env_name}/${dump_date}/beagle-${env_name}-${timestamp}.sql"
fi

output_dir="$(dirname "$output_file")"
mkdir -p "$output_dir"

pg_dump --no-owner --no-privileges --clean --if-exists "$DATABASE_URL" > "$output_file"

echo "Dump created: $output_file"
