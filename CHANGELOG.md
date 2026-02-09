# Changelog

## [Unreleased]

- Refactor architecture toward layered backend and shared contracts/client.
- Add `@beagle/server`, `@beagle/contracts`, and `@beagle/api-client` packages.
- Move auth route orchestration to `@beagle/server` services.
- Add admin route group with access gate in `apps/web/app/(admin)`.
- Remove placeholder import write flow and return not-implemented for import POST until schema is designed.
- Remove unused `@beagle/domain` package and migrate remaining contract type usage to `@beagle/contracts`.
- Add phase-1 data foundation for public stats and dog search:
  - Prisma schema/models for dogs, breeders, owners, ownerships, trial/show events, and import runs
  - Legacy phase-1 import service with admin-only v1 API routes
  - Keep UI/read APIs unchanged for now (import-first groundwork only)
- Standardize Prisma model field ordering (id, business, relations, audit metadata last) with no schema semantic changes.

Files:

- `apps/api/app/api/auth/login/route.ts`
- `apps/api/app/api/auth/register/route.ts`
- `apps/api/app/api/auth/me/route.ts`
- `apps/api/app/api/auth/logout/route.ts`
- `apps/api/app/api/import/example/route.ts`
- `apps/api/package.json`
- `apps/api/tsconfig.json`
- `apps/web/app/(auth)/login/page.tsx`
- `apps/web/app/(auth)/register/page.tsx`
- `apps/web/app/(admin)/layout.tsx`
- `apps/web/app/(admin)/admin/page.tsx`
- `apps/web/components/auth-status.tsx`
- `apps/web/components/import-status.tsx`
- `apps/web/components/admin-gate.tsx`
- `apps/web/package.json`
- `apps/web/tsconfig.json`
- `packages/api-client/index.ts`
- `packages/api-client/package.json`
- `packages/api-client/tsconfig.json`
- `packages/contracts/index.ts`
- `packages/contracts/package.json`
- `packages/contracts/tsconfig.json`
- `packages/server/auth/service.ts`
- `packages/server/auth/service.test.ts`
- `packages/server/admin/service.ts`
- `packages/server/index.ts`
- `packages/server/package.json`
- `packages/server/shared/result.ts`
- `packages/server/shared/types.ts`
- `packages/server/tsconfig.json`
- `docs/planning/public-read-admin-write-layered-refactor.md`
- `packages/db/prisma/schema.prisma`
- `packages/db/index.ts`
- `packages/server/imports/service.ts`
- `apps/api/app/api/v1/imports/[id]/route.ts`
- `packages/server/scripts/run-legacy-phase1.ts`
- `README.md`
- `packages/db/prisma/schema.prisma`
- `CHANGELOG.md`
