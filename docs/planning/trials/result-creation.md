# BEJ-103 Gate R1 — Manual Result Schema and Backend

## Purpose

This plan defines the independently mergeable schema and backend foundation
for one-at-a-time manual `TrialEntry` creation. It is implemented from the
BEJ-103 integration branch after the event workspace and empty-event lifecycle
defined in [Event creation](./event-creation.md) are complete.

This gate does not expose manual result creation in the admin UI. Cross-slice
decisions and review rules remain in the [planning overview](./README.md).

## Canonical registration and identity

Manual creation and Koiratietokanta API ingestion must use the same shared
registration normalization, validation, and trial-entry identity helpers.
Registration is validated and normalized before it is logged, used for a
database lookup, checked for duplicates, or included in an identity key. Raw
registration input must not be logged or used for identity generation,
duplicate detection, or registration lookup. Only the validated canonical
value may be used in database operations.

The canonical manual/API identity is:

`SKL:<sklKoeId>|REG:<canonicalRegistration>`

The following invariants apply:

- Identity generation depends only on the event's `sklKoeId` and canonical
  registration. It does not depend on whether `DogRegistration` resolves.
- `TrialEntry.rekisterinumeroSnapshot` stores the canonical registration for
  manual and Koiratietokanta API writes.
- Linking an initially unlinked entry to a dog later changes `dogId`, not the
  registration snapshot or identity key.
- The same canonical identity is used whether the result was first created
  manually or first received from the Koiratietokanta API.

Source tags remain distinct:

- the one-shot legacy bootstrap writes `LEGACY_AKOEALL`;
- manual admin creation writes `MANUAL_ADMIN`; and
- Koiratietokanta API ingestion writes `KOIRATIETOKANTA_API`.

## Duplicate guarantee

Creation must reject an entry when the selected event already contains the
same canonical registration, regardless of input formatting, dog linkage, or
whether the existing row is manual or from the Koiratietokanta API.

The existing schema provides both required database guarantees:

- `TrialEntry.yksilointiAvain` is globally unique; and
- `(TrialEntry.trialEventId, TrialEntry.rekisterinumeroSnapshot)` is unique.

No new uniqueness constraint is added in R1. The DB write may check both
identities inside its transaction to return an intentional conflict early, but
concurrent creation must also be protected by the existing constraints. A
Prisma `P2002` targeting either trial-entry identity constraint maps to the
stable `TRIAL_ENTRY_REGISTRATION_CONFLICT` result. Other uniqueness failures
remain unexpected persistence errors.

## DogRegistration resolution

The DB lookup uses only the canonical registration. The current schema
guarantees `DogRegistration.registrationNo @unique`, so at most one dog can
match and the write must use `findUnique`; it must never select the first row
from a non-unique result set.

- One match links its `dogId` to the new entry.
- No match creates a valid unlinked entry with `dogId=null`.
- Multiple matches are not a runtime branch because the database constraint
  prevents that state. A uniqueness failure while maintaining registrations
  is an internal invariant failure, not a manual-result conflict.

## Authoritative Koiratietokanta replacement

When a later Koiratietokanta API upsert matches a manual entry by canonical
identity, it updates the existing `TrialEntry` in place and does not create a
second entry.

The replacement boundary is:

- Preserve the existing entry `id`, `trialEventId`, canonical registration
  snapshot, `yksilointiAvain`, and database-row `createdAt`; `updatedAt`
  changes normally. Incoming API creation or modification timestamps, when
  available, belong only in their designated source metadata and must not
  replace the row creation timestamp.
- Replace all entry-level result, snapshot, judge, owner, status, score, and
  other business fields with an explicit complete replacement object produced
  from the Koiratietokanta mapper. Do not spread partial API values over the
  existing row because absent properties could retain stale manual data.
- Explicitly clear fields that can be entered manually but have no
  Koiratietokanta entry-level value, rather than retaining stale manual data.
  The current known case is `TrialEntry.tja`.
- Set `lahde` from `MANUAL_ADMIN` to `KOIRATIETOKANTA_API` and replace
  source-specific raw metadata with the incoming API payload.
- Delete all existing eras and create the authoritative API eras. This also
  removes manual-only era values, including `tja` and `pin` when the API mapper
  has no corresponding era value.
- Replace all lisatiedot through the recreated eras; no manual lisatieto row
  survives unless it is also present in the API mapping.
- If canonical registration resolves through `DogRegistration`, set `dogId`
  to that dog. If it does not resolve, preserve an existing dog link rather
  than clearing it; an already unlinked entry remains unlinked.
- Keep the existing Koiratietokanta event upsert authoritative for its mapped
  `TrialEvent` fields without changing the stable entry identity.

The regression fixture must begin with values in every manually writable
field. It must assert this complete boundary by proving that each value is
replaced by the API mapping or explicitly cleared, including preserved
technical identity, nullable snapshots, entry-level `tja`, era/lisatieto
replacement, dog-link behavior, source tag, and raw metadata.

## Shared validation boundary

Create and update remain separate use-cases and separate DB writes. R1 may
extract reusable validation and normalization primitives for their shared
entry, era, and lisatieto shapes, but it must not introduce a generic “save
result” orchestration function.

The following remain owned separately by create and update:

- authorization and request contracts;
- event and entry lookup;
- registration normalization and duplicate rules;
- persistence orchestration and transaction ownership;
- structured audit logging; and
- response shape and service status mapping.

Existing update behavior and its current error codes remain unchanged unless a
shared primitive can be adopted without changing that use-case's contract.

## Transaction ownership

The focused manual-result DB creation operation owns the transaction. The same
Prisma transaction client must perform, in order:

1. load the selected `TrialEvent`;
2. require its `sklKoeId`;
3. generate and check the canonical identity from the already validated
   canonical registration;
4. resolve `DogRegistration` by canonical registration;
5. create the `TrialEntry`;
6. create validated continuous eras starting from 1;
7. create each era's lisatiedot; and
8. perform any explicit related persistence that must be atomic; existing
   database audit triggers execute within the same transaction.

Any failure rolls back the complete write. Existing database audit triggers run
inside this transaction. Service-level `pino` logging remains outside the DB
transaction and records normalized identifiers only.

The DB layer returns typed outcomes such as created, event missing, event
missing SKL ID, and registration conflict. It maps only relevant identity
constraint violations to the conflict outcome so a concurrency race cannot
leak as an unexpected error or create a duplicate.

## Stable errors and layer ownership

R1 defines stable codes for later R2 localization and mutation handling. R2
must not inspect backend message strings.

| Status | Code                                | Meaning                                                                  |
| ------ | ----------------------------------- | ------------------------------------------------------------------------ |
| 400    | `INVALID_TRIAL_EVENT_ID`            | The event identifier is empty or invalid.                                |
| 400    | `INVALID_REGISTRATION_NUMBER`       | Registration is missing or fails canonical validation.                   |
| 400    | `INVALID_TRIAL_ENTRY`               | Entry-level fields are invalid.                                          |
| 400    | `INVALID_TRIAL_ERAS`                | Eras are missing, non-continuous, duplicated, or contain invalid values. |
| 400    | `INVALID_TRIAL_ADDITIONAL_INFO`     | Lisatieto codes, era references, or values are invalid.                  |
| 404    | `TRIAL_EVENT_NOT_FOUND`             | The selected event does not exist.                                       |
| 409    | `TRIAL_EVENT_MISSING_SKL_ID`        | The event cannot produce API-compatible identity.                        |
| 409    | `TRIAL_ENTRY_REGISTRATION_CONFLICT` | Canonical registration already exists in the event.                      |

Existing `UNAUTHENTICATED` and `FORBIDDEN` authorization codes remain in use.

- Shared validators return typed validation issue categories and normalized
  values; they do not select HTTP statuses.
- The create service selects the stable code and HTTP status, maps typed DB
  outcomes, and owns structured success/failure logging.
- The Server Action performs its existing admin/session guard and passes the
  service code through as `errorCode` without interpreting message text.

## Date-only invariant

`TrialEvent.koepaiva` is a calendar date with no timezone or time-of-day
semantics throughout contracts, services, database queries, filters, year
derivation, and serialization.

- Prisma declares it as `DateTime @db.Date`, and PostgreSQL stores it as
  `DATE`.
- Existing public and internal `YYYY-MM-DD` contracts remain unchanged.
- Application code must use timezone-free date-only parsing and serialization;
  it must not derive the event date through Helsinki or runtime timezone
  conversion.
- Year filters operate directly on `[YYYY-01-01, nextYear-01-01)` date-only
  boundaries.
- User-facing inclusive ranges operate directly on
  `[dateFrom, dayAfter(dateTo))` date-only boundaries.
- Rule-window resolution continues to use the date's UTC year/month/day carrier
  solely as the Prisma representation of the calendar date.

## Gate R1 scope

- Add `MANUAL_ADMIN` to `TrialSourceTag`.
- Change `TrialEvent.koepaiva` to PostgreSQL `DATE` and update all trial date
  handling to the date-only invariant.
- Add manual-result request/response contracts, a create service, the focused
  transactional DB write, and the admin Server Action transport.
- Accept `trialEventId`, registration, and the existing entry, era, and
  lisatieto write shape used by result editing.
- Store `lahde=MANUAL_ADMIN`, canonical `rekisterinumeroSnapshot`, and the
  canonical API-compatible identity.
- Add the full backend and authoritative-upsert regression coverage described
  by this plan.
- Update the nearest schema, integration, and admin-trial developer
  documentation changed by R1.

### Bootstrap migration rule

The original canonical trial migration may be edited in place because these
tables are still recreated through the documented one-shot bootstrap and
forward migrations for this schema are not supported. The original migration
must create `TrialSourceTag` with `MANUAL_ADMIN` and create `koepaiva` as
`DATE`; no conversion or follow-up migration is added.

Adding `MANUAL_ADMIN` here only declares an allowed enum value in fresh schema
DDL. It does not assign that source to legacy rows: the one-shot legacy
projection continues to write `LEGACY_AKOEALL` explicitly.

No preserved environment may consume the edited migration incrementally.
Implementation and validation must not:

- run `prisma migrate reset`;
- run any other Prisma migration, deploy, resolve, status, `db push`, or client
  generation command;
- reset, recreate, or modify any local or remote database automatically;
- attempt to resolve migration checksum drift automatically; or
- run a fresh bootstrap without separate explicit approval.

The user owns all Prisma migration, database, bootstrap, and client-generation
commands. If the unchanged generated client prevents a local type check, report
that limitation instead of regenerating it.

## Explicit exclusions

- No result-creation page or route.
- No React components or forms.
- No React Query mutation hook.
- No navigation or event-create continuation changes.
- No dirty-state handling or UI localization.
- No user-facing changelog entry.
- No manual browser testing for an unavailable UI.
- No existing result-editing redesign.
- No batch creation, autosave, draft/publish state, or reconciliation UI.
- No new ingestion endpoint or external Koiratietokanta contract change.
- No unrelated refactoring.

The admin Server Action and its mapping tests are the only web-layer additions
permitted in R1.

## Acceptance criteria

- An authorized call creates exactly one complete manual entry or creates
  nothing when any nested write fails.
- Canonically equivalent registration inputs conflict within the event for
  linked, unlinked, manual, and Koiratietokanta API existing entries.
- Existing database uniqueness protects concurrent creation, and relevant
  constraint failures return `TRIAL_ENTRY_REGISTRATION_CONFLICT`.
- A uniquely matching `DogRegistration` links the dog; no match creates an
  unlinked entry without changing canonical identity.
- Source, registration snapshot, and identity match the documented invariants.
- All stable validation, not-found, missing-SKL, conflict, authorization, and
  internal-error mappings are covered without relying on message strings.
- A later matching Koiratietokanta upsert satisfies the complete authoritative
  replacement boundary.
- All trial event date behavior satisfies the date-only invariant without
  changing existing `YYYY-MM-DD` contracts.

## Targeted validation

- Static Prisma-schema and SQL inspection for `MANUAL_ADMIN` and `@db.Date`,
  proving the original bootstrap SQL creates the enum value and `DATE`
  directly. Do not generate the Prisma client or apply the schema.
- Date tests in non-UTC runtime timezones with positive and negative offsets,
  values around midnight, inclusive start/end dates, December 31/January 1,
  and year filters without timezone drift.
- DB tests for linked and unlinked creation, identity fields, all duplicate
  variants, nested writes, rollback, and typed transaction outcomes.
- A database-constraint-level or concurrent-create test proving the existing
  uniqueness constraints—not only a read-before-write check—prevent duplicate
  creation. This test must use an explicitly prepared test database and must
  not reset one automatically.
- Server tests for authorization, canonical normalization, event validation,
  stable error selection, entry/era/lisatieto validation, conflict mapping,
  and normalized structured logging.
- Server Action tests for authentication and transparent service-result/error
  mapping.
- Koiratietokanta DB/service regression tests for the complete manual-to-API
  replacement boundary.
- Targeted type checking and linting for contracts, DB, server, and the web
  Server Action; do not run cycle lint in the agent workflow.

## Merge independence and review gate

R1 can merge independently from the BEJ-103 integration branch after E2. Its
write path has no linked admin UI, and its schema, transaction, identity,
errors, date-only behavior, and authoritative-upsert contract are complete
without R2.

Stop after validation and request explicit review. R2 must be planned and
approved separately without reopening the backend decisions finalized here.
