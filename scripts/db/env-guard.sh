#!/usr/bin/env bash

is_known_safe_env_file() {
  case "$1" in
    .env.local | .env.development | .env.test | .env.staging)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

resolve_db_target() {
  local env_file="$1"

  pass-cli run --env-file "$env_file" -- node -e '
const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}
let url;
try {
  url = new URL(raw);
} catch {
  console.error("Invalid DATABASE_URL");
  process.exit(1);
}
const host = (url.hostname || "").toLowerCase();
const dbName = (url.pathname || "").replace(/^\/+/, "").toLowerCase();
process.stdout.write(`${host}|${dbName}`);
'
}

ensure_db_operation_allowed() {
  local env_file="$1"
  local operation="$2"
  local env_basename db_target db_host db_name require_confirm

  env_basename="$(basename "$env_file")"
  db_target="$(resolve_db_target "$env_file")"
  db_host="${db_target%%|*}"
  db_name="${db_target#*|}"
  require_confirm=0

  if ! is_known_safe_env_file "$env_basename"; then
    require_confirm=1
  fi

  if [[ "$db_host" =~ (^|[-.])(prod|production)([-.]|$) ]]; then
    require_confirm=1
  fi

  if [[ "$db_name" =~ (^|[_-])(prod|production)([_-]|$) ]]; then
    require_confirm=1
  fi

  if [ "$require_confirm" -eq 1 ] && [ "${CONFIRM_PROD:-}" != "YES" ]; then
    echo "Refusing $operation without CONFIRM_PROD=YES (env: $env_basename, host: $db_host, db: ${db_name:-unknown})"
    echo "Set CONFIRM_PROD=YES only after verifying target DB."
    exit 1
  fi
}
