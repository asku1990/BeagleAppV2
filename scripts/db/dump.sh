#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "" ]; then
  echo "Usage: $0 <env-file> [output-file.sql]"
  exit 1
fi

env_file="$1"
output_file="${2:-}"

if [ ! -f "$env_file" ]; then
  echo "Env file not found: $env_file"
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Shared DB target safety checks used by dump + restore.
source "$script_dir/env-guard.sh"
ensure_db_operation_allowed "$env_file" "database dump"

env_basename="$(basename "$env_file")"
env_name="${env_basename#*.env.}"
if [ "$env_name" = "$env_basename" ]; then
  env_name="${env_basename#.env}"
fi
if [ -z "$env_name" ]; then
  env_name="unknown"
fi

timestamp="$(date +%Y%m%d-%H%M%S)"
if [ -z "$output_file" ]; then
  dump_date="$(date +%Y-%m-%d)"
  output_file="./tmp/db-dumps/${env_name}/${dump_date}/beagle-${env_name}-${timestamp}.sql"
fi

output_dir="$(dirname "$output_file")"
mkdir -p "$output_dir"

pass-cli run --env-file "$env_file" -- sh -c 'pg_dump --no-owner --no-privileges --clean --if-exists "$DATABASE_URL" > "$1"' _ "$output_file"

echo "Dump created: $output_file"
