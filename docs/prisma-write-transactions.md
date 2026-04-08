# Prisma Write Transactions

This document defines the default rule for Prisma interactive write transactions in this repository.

## Rule

- Any write path that uses `prisma.$transaction(async (tx) => ...)` must pass explicit transaction options.
- Do not rely on Prisma's default interactive transaction timeout for repository write code.
- Use shared config constants from `packages/db/core/interactive-write-transaction.ts` instead of feature-local ad hoc values.

## Default budgets

- `ADMIN_WRITE_TX_CONFIG`
  - Use for normal admin and service-layer write flows.
  - Current budget: `maxWait=5s`, `timeout=15s`.
- `LONG_RUNNING_WRITE_TX_CONFIG`
  - Use only for known heavier write flows that still need one interactive transaction.
  - Current budget: `maxWait=10s`, `timeout=20s`.

## Performance rule

- Increasing timeout is not the default fix for a slow write path.
- If a transaction fans out across many rows, prefer set-based SQL, `createMany`/`updateMany`, or other batching before increasing the budget further.
- Keep heavy rewrite logic inside one transaction only when atomicity is required by the feature contract.

## Current rollout

- Admin show manage writes use the shared admin write budget.
- Audited admin dog writes inherit the shared admin write budget via `runInAuditContextDb`.
- Workbook import uses the shared long-running write budget because it intentionally persists a larger all-or-nothing batch.

## Error handling

- Service-layer code should treat Prisma transaction timeout failures as an explicit operational error, not as an undifferentiated internal error.
- Timeout detection should reuse `packages/server/core/prisma-transaction-timeout.ts`.
