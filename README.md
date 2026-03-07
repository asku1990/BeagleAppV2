# Beagle App v2

Monorepo for a public Beagle database app with auth, admin-ready routing, and a single Next.js server runtime.

## Quick links

- Architecture rules and boundaries: [ARCHITECTURE.md](ARCHITECTURE.md)
- Developer workflow and agent rules: [AGENTS.md](AGENTS.md)
- Documentation rules: [docs/documentation-rules.md](docs/documentation-rules.md)
- Tech debt register: [docs/tech-debt.md](docs/tech-debt.md)
- App usage guide: [docs/app-usage-and-features.md](docs/app-usage-and-features.md)
- Env safety and runbooks: [docs/ops-env-safety.md](docs/ops-env-safety.md)
- Import behavior details: [docs/import-phase1.md](docs/import-phase1.md)
- Deployment notes: [docs/vercel-deployment.md](docs/vercel-deployment.md)
- Changelog: [CHANGELOG.md](CHANGELOG.md)

## Requirements

- Node.js 20+
- pnpm 10+
- PostgreSQL for app data
- MariaDB only for phase-1 legacy import

## Quick start (local)

All commands assume repository root (`beagle-app-v2/`).

1. Copy local environment template:

```bash
cp .env.example .env.local
```

2. Update `.env.local` with values for your machine.
   Required for first run:

- `DATABASE_URL` (PostgreSQL)
- `BETTER_AUTH_SECRET` (minimum 32 characters)

Useful for admin login setup:

- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_PASSWORD`

Needed only for legacy import:

- `LEGACY_DATABASE_URL` (MariaDB)

3. Install dependencies:

```bash
pnpm install
```

4. Generate Prisma client:

```bash
pnpm db:generate
```

5. Apply committed migrations (recommended):

```bash
pnpm db:deploy
```

Optional local-only shortcut (no migration files applied):

```bash
pnpm db:push
```

6. Start local web app:

```bash
pnpm dev
```

Default URL: `http://localhost:3000`

7. Optional: bootstrap first admin user:

```bash
pnpm auth:bootstrap-admin
```

## Environment safety

For staging/prod commands and explicit env-file loading, use:

- [Pre-flight checklist](docs/ops-env-safety.md#pre-flight-checklist)
- [Safe command templates](docs/ops-env-safety.md#safe-command-templates)

## Common dev commands

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Targeted checks:

```bash
pnpm --filter @beagle/web test:unit
pnpm --filter @beagle/server test:unit
pnpm --filter @beagle/db test
pnpm --filter @beagle/web test:e2e
```

## DB and auth helpers

```bash
pnpm db:studio
pnpm audit:prune
pnpm auth:generate
pnpm auth:migrate
pnpm auth:bootstrap-admin
pnpm auth:set-password
```

## Deploy

Vercel build command:

```bash
pnpm vercel:build
```

See `docs/vercel-deployment.md` for supported Vercel project setups.

## Notes

- README is intentionally minimal and usage-focused.
- Detailed feature behavior, API surface, and implementation conventions are in `docs/app-usage-and-features.md`.
- Documentation workflow and future cleanup note conventions are in `docs/documentation-rules.md` and `docs/tech-debt.md`.
- Source of truth for architecture and dependency boundaries is `ARCHITECTURE.md`.
