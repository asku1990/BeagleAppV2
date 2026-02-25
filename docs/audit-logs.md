# Audit Logs

This document covers common maintenance operations for the `AuditEvent` table.

## Preferred command

Use the built-in prune script for normal maintenance:

```bash
pnpm audit:prune
```

Current behavior: deletes rows older than 12 months in batches.

## SQL cleanup commands

Run these against the application PostgreSQL database when you need manual cleanup.

Keep last 365 days:

```sql
DELETE FROM "AuditEvent"
WHERE "happenedAt" < NOW() - INTERVAL '365 days';
```

Keep last 180 days:

```sql
DELETE FROM "AuditEvent"
WHERE "happenedAt" < NOW() - INTERVAL '180 days';
```

Keep last 90 days:

```sql
DELETE FROM "AuditEvent"
WHERE "happenedAt" < NOW() - INTERVAL '90 days';
```

Clear all rows:

```sql
DELETE FROM "AuditEvent";
```

Check remaining row count:

```sql
SELECT COUNT(*) FROM "AuditEvent";
```

## After large deletes

Reclaim space and refresh planner stats:

```sql
VACUUM (ANALYZE) "AuditEvent";
```

## Safety notes

- `DELETE` operations are destructive; verify target DB first.
- For staging/production, follow env safety guidance in `docs/ops-env-safety.md`.
- `db:dump` excludes `AuditEvent` data by default unless `DUMP_INCLUDE_AUDIT_LOGS=1`.
