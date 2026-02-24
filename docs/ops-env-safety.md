# Ops Environment Safety

This guide is for running environment-sensitive commands safely.
Use this file as the source of truth for env-specific command variants.

All commands in this guide assume current directory is repo root: `beagle-app-v2/`.

## Safety rules

- Always load env explicitly with `pass-cli run --env-file ...`.
- Do not use plain `.env` for runtime commands.
- Require `CONFIRM_PROD=YES` for any prod-targeted command.
- Prefer package-scoped commands (`pnpm --filter ...`) so the target area is explicit.
- Avoid shorthand aliases that hide environment intent.
- `pnpm <command>` uses only current process env; `pass-cli run --env-file ... -- pnpm <command>` injects vars from the selected env file.

## Pre-flight checklist

Before running a staging/prod command:

1. Confirm selected env file: `.env.staging` or `.env.prod`.
2. Print and verify target host from `DATABASE_URL`.
3. Confirm command scope (`@beagle/web`, `@beagle/db`, `@beagle/server`).
4. For prod, add `CONFIRM_PROD=YES`.
5. For destructive DB operations, confirm a backup/snapshot exists.

## Safe command templates

Run app:

```bash
pass-cli run --env-file .env.local -- pnpm --filter @beagle/web dev
pass-cli run --env-file .env.staging -- pnpm --filter @beagle/web dev
CONFIRM_PROD=YES pass-cli run --env-file .env.prod -- pnpm --filter @beagle/web dev
```

Playwright:

```bash
pass-cli run --env-file .env.local -- pnpm test:playwright
pass-cli run --env-file .env.staging -- pnpm test:playwright
CONFIRM_PROD=YES pass-cli run --env-file .env.prod -- pnpm test:playwright
```

Test suite:

```bash
pass-cli run --env-file .env.local -- pnpm test
pass-cli run --env-file .env.staging -- pnpm test
CONFIRM_PROD=YES pass-cli run --env-file .env.prod -- pnpm test
```

E2E suite:

```bash
pass-cli run --env-file .env.local -- pnpm test:e2e
pass-cli run --env-file .env.staging -- pnpm test:e2e
CONFIRM_PROD=YES pass-cli run --env-file .env.prod -- pnpm test:e2e
```

Prisma `db push`:

```bash
pass-cli run --env-file .env.local -- pnpm --filter @beagle/db exec prisma db push
pass-cli run --env-file .env.staging -- pnpm --filter @beagle/db exec prisma db push
CONFIRM_PROD=YES pass-cli run --env-file .env.prod -- pnpm --filter @beagle/db exec prisma db push
```

Prisma `migrate dev` (local only):

Note: this may become interactive (for example drift/reset prompts). If that happens, run it directly in an interactive terminal session.

```bash
pass-cli run --env-file .env.local -- pnpm --filter @beagle/db exec prisma migrate dev --name <migration_name>
```

Prisma `migrate reset` (destructive):

Note: via Proton Pass (`pass-cli run --env-file ...`), Prisma runs this as non-interactive.
If Prisma refuses to run in non-interactive mode, add `--force`.

```bash
pass-cli run --env-file .env.local -- pnpm --filter @beagle/db exec prisma migrate reset [--force]
pass-cli run --env-file .env.staging -- pnpm --filter @beagle/db exec prisma migrate reset [--force]
CONFIRM_PROD=YES pass-cli run --env-file .env.prod -- pnpm --filter @beagle/db exec prisma migrate reset [--force]
```

Prisma `migrate deploy`:

```bash
pass-cli run --env-file .env.local -- pnpm --filter @beagle/db exec prisma migrate deploy
pass-cli run --env-file .env.staging -- pnpm --filter @beagle/db exec prisma migrate deploy
CONFIRM_PROD=YES pass-cli run --env-file .env.prod -- pnpm --filter @beagle/db exec prisma migrate deploy
```

Prisma Studio:

```bash
pass-cli run --env-file .env.local -- pnpm db:studio
pass-cli run --env-file .env.staging -- pnpm db:studio
CONFIRM_PROD=YES pass-cli run --env-file .env.prod -- pnpm db:studio
```

Bootstrap first admin:

```bash
pass-cli run --env-file .env.local -- pnpm auth:bootstrap-admin
pass-cli run --env-file .env.staging -- pnpm auth:bootstrap-admin
CONFIRM_PROD=YES pass-cli run --env-file .env.prod -- pnpm auth:bootstrap-admin
```

Set existing user password:

```bash
pass-cli run --env-file .env.local -- pnpm auth:set-password
pass-cli run --env-file .env.staging -- pnpm auth:set-password
CONFIRM_PROD=YES pass-cli run --env-file .env.prod -- pnpm auth:set-password
```

Phase-1 import:

```bash
pass-cli run --env-file .env.local -- pnpm import:phase1
pass-cli run --env-file .env.staging -- pnpm import:phase1
CONFIRM_PROD=YES pass-cli run --env-file .env.prod -- pnpm import:phase1
```

Inspect phase-1 import issues:

```bash
pass-cli run --env-file .env.local -- pnpm import:issues <RUN_ID>
pass-cli run --env-file .env.staging -- pnpm import:issues <RUN_ID>
CONFIRM_PROD=YES pass-cli run --env-file .env.prod -- pnpm import:issues <RUN_ID>
```

Note: `import:issues` prints to terminal only (no files written).
To export CSV files to `./tmp/import-issues/<RUN_ID>`:

```bash
pass-cli run --env-file .env.local -- pnpm import:issues:csv <RUN_ID>
pass-cli run --env-file .env.staging -- pnpm import:issues:csv <RUN_ID>
CONFIRM_PROD=YES pass-cli run --env-file .env.prod -- pnpm import:issues:csv <RUN_ID>
```

PostgreSQL dump/restore prerequisites:

- `pg_dump` and `psql` must be available in the shell where you run `pnpm`.
- macOS example: `brew install libpq`
- Add PostgreSQL client binaries to your shell PATH (zsh example: `echo 'export PATH="/opt/homebrew/opt/libpq/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc`).

PostgreSQL dump (schema + data):

```bash
# Default output is nested by env and date:
# ./tmp/db-dumps/<env>/<YYYY-MM-DD>/beagle-<env>-<timestamp>.sql
pass-cli run --env-file .env.local -- pnpm db:dump
CONFIRM_PROD=YES pass-cli run --env-file .env.staging -- pnpm db:dump
CONFIRM_PROD=YES pass-cli run --env-file .env.prod -- pnpm db:dump

# Optional explicit path:
pass-cli run --env-file .env.local -- pnpm db:dump ./tmp/db-dumps/local/refresh/local-refresh.sql
```

Note: `db:dump`/`db:restore` are fail-safe and require `CONFIRM_PROD=YES` unless the target looks clearly local/staging/dev/test by host or DB name.

PostgreSQL restore from dump (destructive to target DB contents):

```bash
CONFIRM_PROD=YES pass-cli run --env-file .env.staging -- pnpm db:restore ./tmp/db-dumps/local/<YYYY-MM-DD>/beagle-local-<timestamp>.sql
CONFIRM_PROD=YES pass-cli run --env-file .env.prod -- pnpm db:restore ./tmp/db-dumps/local/<YYYY-MM-DD>/beagle-local-<timestamp>.sql
```

Suggested local -> staging refresh flow:

1. `pass-cli run --env-file .env.local -- pnpm db:dump`
2. `ls -1t ./tmp/db-dumps/local/*/beagle-local-*.sql | head -n 1`
3. `pass-cli run --env-file .env.staging -- pnpm --filter @beagle/db exec prisma migrate reset --force`
4. `CONFIRM_PROD=YES pass-cli run --env-file .env.staging -- pnpm db:restore <latest-local-dump-from-step-2>`
5. `pass-cli run --env-file .env.staging -- pnpm --filter @beagle/db exec prisma migrate deploy`

Example (auto-pick latest local dump):

```bash
latest_dump=$(ls -1t ./tmp/db-dumps/local/*/beagle-local-*.sql 2>/dev/null | head -n 1)
CONFIRM_PROD=YES pass-cli run --env-file .env.staging -- pnpm db:restore "$latest_dump"
```

## Optional explicit host check

Use this before staging/prod DB commands:

```bash
pass-cli run --env-file .env.staging -- node -e 'const raw = process.env.DATABASE_URL; if (!raw) throw new Error("DATABASE_URL is not set"); const u = new URL(raw); console.log(u.hostname + (u.port ? ":" + u.port : ""));'
pass-cli run --env-file .env.prod -- node -e 'const raw = process.env.DATABASE_URL; if (!raw) throw new Error("DATABASE_URL is not set"); const u = new URL(raw); console.log(u.hostname + (u.port ? ":" + u.port : ""));'
```
