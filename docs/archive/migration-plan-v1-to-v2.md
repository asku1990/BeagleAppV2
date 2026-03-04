# Migration Plan: beagleAppV1 -> Beagle App v2

This plan describes how to move from legacy PHP app data/behavior to the new modular stack.

## Goals

- Preserve critical data integrity.
- Migrate in small, reversible phases.
- Keep data model aligned with new domain boundaries.

## Source and target

- Source: `beagleAppV1` (legacy PHP + MariaDB patterns).
- Target: Beagle App v2 (`packages/db` Prisma schema + service layer in `packages/server`).

## Phase 1: Inventory and mapping

1. Catalog legacy entities and relationships (dogs, pedigrees, trials, breeding, users/admin).
2. Map each legacy table/field to Prisma models.
3. Mark unknown/obsolete fields explicitly.

Deliverable:

- Mapping table file in `docs/migration/` (to be created when mapping work starts).

## Phase 2: Read-only parity

1. Import a representative subset of data.
2. Validate read APIs against expected legacy outputs.
3. Resolve data normalization issues (naming, nullability, enum conversion).

Exit criteria:

- Read APIs for core entities return trusted parity data.

## Phase 3: Auth/admin transition

1. Establish user/role migration strategy.
2. Create admin verification checks in backend routes.
3. Validate admin-only operations with tests.

Exit criteria:

- Admin capabilities in v2 are server-enforced and test-covered.

## Phase 4: Write/import workflows

1. Implement import pipeline in `imports` domain.
2. Add idempotency and validation rules.
3. Provide rollback/retry process for failed batches.

Exit criteria:

- Import runs are repeatable, auditable, and safe.

## Phase 5: Cutover

1. Freeze legacy writes.
2. Run final migration and verification checks.
3. Switch traffic to v2.
4. Keep rollback plan for limited window.

## Data safety requirements

- Keep pre-migration backups.
- Track migration runs with timestamps and counts.
- Validate row counts and key constraints after each run.

## Non-goals for initialization stage

- No full rewrite of all legacy features before first usable release.
- No premature split into separate admin/forum deployments until operationally needed.
