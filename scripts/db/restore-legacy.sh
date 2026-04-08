#!/usr/bin/env bash
set -euo pipefail

default_dump_file="/Users/akikuivas/personal-projects/beagle/beagle_db_v1_dumps/beagle.sql"

if [ "${3:-}" != "" ]; then
  echo "Usage: $0 [dump-file.sql] [database-name]"
  echo "Do not pass env file as an argument."
  echo "Use: pass-cli run --env-file .env.local -- pnpm legacy:restore [dump-file.sql] [database-name]"
  exit 1
fi

dump_file="${1:-$default_dump_file}"
target_db_override="${2:-}"

if [ ! -f "$dump_file" ]; then
  echo "Dump file not found: $dump_file"
  exit 1
fi

if [[ "$(basename "$dump_file")" == .env* ]]; then
  echo "Refusing to restore from env file path: $dump_file"
  echo "Use: pass-cli run --env-file .env.local -- pnpm legacy:restore [dump-file.sql] [database-name]"
  exit 1
fi

if [ -z "${LEGACY_DATABASE_URL:-}" ]; then
  echo "LEGACY_DATABASE_URL is not set."
  echo "Run via pass-cli, for example: pass-cli run --env-file .env.local -- pnpm legacy:restore [dump-file.sql] [database-name]"
  exit 1
fi

if ! command -v mysql >/dev/null 2>&1; then
  echo "Required command 'mysql' is not available in PATH."
  echo "Install MariaDB/MySQL client tools and ensure they are on PATH."
  echo "macOS example: brew install mysql-client"
  echo "Then add the mysql-client bin directory to PATH."
  exit 1
fi

legacy_url_no_query="${LEGACY_DATABASE_URL%%\?*}"
legacy_url_body="${legacy_url_no_query#*://}"
legacy_userpass="${legacy_url_body%@*}"
legacy_host_and_db="${legacy_url_body#*@}"
legacy_hostport="${legacy_host_and_db%%/*}"
db_url_name=""
case "$legacy_host_and_db" in
  */*)
    db_url_name="${legacy_host_and_db#*/}"
    db_url_name="${db_url_name%%/*}"
    ;;
esac

db_user="${legacy_userpass%%:*}"
db_password="${legacy_userpass#*:}"
db_host="${legacy_hostport%%:*}"
db_port="${legacy_hostport##*:}"

if [ "$db_port" = "$legacy_hostport" ] || [ -z "$db_port" ]; then
  db_port="3306"
fi

if [ -z "$db_host" ] || [ -z "$db_user" ]; then
  echo "LEGACY_DATABASE_URL must include a host and username."
  exit 1
fi

detect_dump_db_name() {
  perl -ne '
    if (/^CREATE DATABASE.*`([^`]+)`/i) {
      print "$1\n";
      exit;
    }
    if (/^USE `([^`]+)`;/i) {
      print "$1\n";
      exit;
    }
  ' "$1"
}

source_db="$(detect_dump_db_name "$dump_file" || true)"
target_db="${target_db_override:-$source_db}"
if [ -z "$target_db" ]; then
  target_db="$db_url_name"
fi

if [ -z "$target_db" ]; then
  echo "Could not determine the target database name."
  echo "Pass it explicitly as the second argument."
  exit 1
fi

if ! [[ "$target_db" =~ ^[A-Za-z0-9_-]+$ ]]; then
  echo "Invalid database name: $target_db"
  echo "Use only letters, numbers, underscores, and dashes."
  exit 1
fi

if [ -n "$source_db" ] && [ "$source_db" != "$target_db" ]; then
  restore_file="$(mktemp "${TMPDIR:-/tmp}/legacy-restore.XXXXXX.sql")"
  cp "$dump_file" "$restore_file"
  SOURCE_DB="$source_db" TARGET_DB="$target_db" perl -0pi -e 's/`\Q$ENV{SOURCE_DB}\E`/`\Q$ENV{TARGET_DB}\E`/g' "$restore_file"
else
  restore_file="$dump_file"
fi

cleanup() {
  if [ "${restore_file:-}" != "$dump_file" ] && [ -n "${restore_file:-}" ] && [ -f "$restore_file" ]; then
    rm -f "$restore_file"
  fi
}

trap cleanup EXIT

require_confirm=0
case "$db_host" in
  localhost|127.0.0.1|::1)
    require_confirm=0
    ;;
  *)
    case "$target_db" in
      *local*|*test*|*development*|*dev*|*staging*)
        require_confirm=0
        ;;
      *)
        case "$db_host" in
          *staging*|*test*|*development*|*dev*)
            require_confirm=0
            ;;
          *)
            require_confirm=1
            ;;
        esac
        ;;
    esac
    ;;
esac

if [ "$require_confirm" -eq 1 ] && [ "${CONFIRM_PROD:-}" != "YES" ]; then
  echo "Refusing legacy restore without CONFIRM_PROD=YES (host: $db_host, db: $target_db)"
  echo "Set CONFIRM_PROD=YES only after verifying the target DB."
  exit 1
fi

export MYSQL_PWD="$db_password"

mysql_common_args=(
  --protocol=tcp
  --host="$db_host"
  --port="$db_port"
  --user="$db_user"
)

mysql "${mysql_common_args[@]}" --execute "DROP DATABASE IF EXISTS \`$target_db\`; CREATE DATABASE \`$target_db\`;"
mysql "${mysql_common_args[@]}" "$target_db" < "$restore_file"

echo "Restore completed into database: $target_db"
