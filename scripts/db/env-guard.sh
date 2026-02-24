#!/usr/bin/env bash

resolve_db_target() {
  node -e '
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

ensure_database_url_set() {
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "DATABASE_URL is not set."
    echo "Run via pass-cli, for example: pass-cli run --env-file .env.local -- pnpm db:dump"
    exit 1
  fi
}

requires_prod_confirmation() {
  local db_host="$1"
  local db_name="$2"

  if [[ "$db_host" = "localhost" ]] || [[ "$db_host" = "127.0.0.1" ]] || [[ "$db_host" = "::1" ]]; then
    return 1
  fi

  if [[ "$db_name" =~ (^|[_-])(local|test|development|dev|staging)([_-]|$) ]]; then
    return 1
  fi

  if [[ "$db_host" =~ (^|[-.])(staging|test|development|dev)([-.]|$) ]]; then
    return 1
  fi

  return 0
}

ensure_db_operation_allowed() {
  local operation="$1"
  local db_target db_host db_name require_confirm

  db_target="$(resolve_db_target)"
  db_host="${db_target%%|*}"
  db_name="${db_target#*|}"
  require_confirm=0
  if requires_prod_confirmation "$db_host" "$db_name"; then
    require_confirm=1
  fi

  if [ "$require_confirm" -eq 1 ] && [ "${CONFIRM_PROD:-}" != "YES" ]; then
    echo "Refusing $operation without CONFIRM_PROD=YES (host: $db_host, db: ${db_name:-unknown})"
    echo "Set CONFIRM_PROD=YES only after verifying target DB."
    exit 1
  fi
}

ensure_binary_available() {
  local binary="$1"

  if ! command -v "$binary" >/dev/null 2>&1; then
    echo "Required command '$binary' is not available in PATH."
    echo "Install PostgreSQL client tools and ensure they are on PATH."
    echo "macOS example: brew install libpq"
    echo "Then add to PATH: export PATH=\"\$(brew --prefix libpq)/bin:\$PATH\""
    exit 1
  fi
}

infer_db_env_label() {
  local db_target db_host db_name

  db_target="$(resolve_db_target)"
  db_host="${db_target%%|*}"
  db_name="${db_target#*|}"

  if [[ "$db_host" = "localhost" ]] || [[ "$db_host" = "127.0.0.1" ]] || [[ "$db_host" = "::1" ]] || [[ "$db_name" =~ (^|[_-])local([_-]|$) ]]; then
    echo "local"
    return
  fi

  if [[ "$db_host" =~ (^|[-.])staging([-.]|$) ]] || [[ "$db_name" =~ (^|[_-])staging([_-]|$) ]]; then
    echo "staging"
    return
  fi

  if [[ "$db_host" =~ (^|[-.])(prod|production)([-.]|$) ]] || [[ "$db_name" =~ (^|[_-])(prod|production)([_-]|$) ]]; then
    echo "prod"
    return
  fi

  echo "unknown"
}
