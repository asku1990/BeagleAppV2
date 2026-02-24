#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "" ] || [ "${2:-}" = "" ]; then
  echo "Usage: $0 <env-file> <dump-file.sql>"
  exit 1
fi

env_file="$1"
dump_file="$2"

if [ ! -f "$env_file" ]; then
  echo "Env file not found: $env_file"
  exit 1
fi

if [ ! -f "$dump_file" ]; then
  echo "Dump file not found: $dump_file"
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Shared DB target safety checks used by dump + restore.
source "$script_dir/env-guard.sh"
ensure_db_operation_allowed "$env_file" "database restore"

pass-cli run --env-file "$env_file" -- sh -c 'psql -v ON_ERROR_STOP=1 "$DATABASE_URL" < "$1"' _ "$dump_file"

echo "Restore completed from: $dump_file"
