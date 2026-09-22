# Dog Registry Import: Phase One

## Status and notation

Implementation-ready planning document. No production implementation exists yet.

This document uses these labels:

- **Confirmed**: current repository or inspected-workbook behavior.
- **Phase one**: behavior proposed for the Finnish registry import.
- **Deferred**: a deliberate future extension, not phase-one scope.

## Goal

Add a safe, repeatable admin workflow for importing Finnish Beagle registry
workbooks at `/admin/dogs/import`.

The workflow must parse and preview the workbook without dog-data writes,
classify every source row, expose warnings and blockers, and apply the exact
reviewed plan in one audited transaction. Blocking problems are corrected in
the workbook or through the existing admin dog workflow and then re-previewed;
phase one has no inline editing.

## Phase-one scope

- Finnish registry `.xlsx` source only.
- Beagles only (`Rotukoodi = 161`).
- Upload -> review -> confirm/apply -> completion flow.
- Create new normal dogs.
- Update existing dogs according to the effective import policy.
- Recognize unchanged rows.
- Create missing valid parents as `REFERENCE_ONLY` identities.
- Promote an existing `REFERENCE_ONLY` dog when that dog later appears as a
  valid full source row.
- Persist registration date, origin type, origin country, tail text, kennel
  text, and mapped canonical color where provided.
- Reuse existing audit infrastructure for database mutations.
- Keep apply all-or-nothing and safe against stale previews and concurrent
  imports.

## Explicit non-goals

- Swedish MHTML parsing or MHTML-to-XLSX conversion.
- Import history or an import dashboard.
- Persisted import rows, raw workbook rows, or uploaded workbook files.
- Database-backed import-policy settings.
- Per-session policy overrides or override-resolution code.
- Inline issue resolution or workbook editing.
- Breeder-table creation, matching, or reconciliation.
- Owner, title, disease, show-result, or trial-result import.
- Dog search, dog result table, dog profile, or dog edit-form redesign.
- Automatic dog merging or registration reassignment.
- Explicit clearing of stored dog values.

## Confirmed repository findings

### Architecture and feature placement

- `apps/web` owns routes and UI; business behavior belongs in
  `packages/server`; persistence belongs in `packages/db`; transport DTOs belong
  in `packages/contracts`.
- The feature is admin-specific and dog-centric, so canonical feature folders
  are `admin/dogs/import` in each layer.
- Mutations normally use Server Actions, but multipart workbook upload is a
  stronger HTTP reason for route handlers. Current Next configuration does not
  raise the approximately 1 MB Server Action body limit.
- The existing show workbook importer demonstrates shared preview/apply
  evaluation and atomic workbook writes, but it does not bind apply to the
  reviewed preview and does not set dog-style audit context.

### Dog identity and pedigree

- `Dog.status` supports `NORMAL` and `REFERENCE_ONLY`.
- `Dog` already stores name, sex, birth date, breeder text, sire, dam, breeder,
  color, note, and timestamps.
- `DogRegistration.registrationNo` is globally unique and has a free-text
  `source`; it has no registration date.
- Public root searches and profiles include only `NORMAL` dogs. Reference-only
  ancestors remain available to pedigrees and calculations.
- A reference-only dog may contain all known details. Status represents public
  identity behavior, not completeness.
- Unknown reference-only names use the normalized registration number as the
  required `Dog.name` fallback.
- Existing admin parent validation rejects the same dog as both parents,
  self-parenting on update, and sire/dam sex mismatches.
- Existing admin dog create/update persistence resolves `breederNameText` to a
  `Breeder` row automatically. The registry importer must not reuse those write
  functions unchanged because breeder reconciliation is out of scope.
- Existing dog creation links unlinked historical show and trial entries by
  registration number. Registry-created and promoted dogs should preserve this
  behavior inside the import transaction, using only entry IDs included in the
  reviewed plan.

### Registration, color, and dates

- Canonical registration normalization in `packages/server/dogs/core` trims and
  uppercases values. The shared validator accepts Unicode letters/numbers and
  `/`, `.`, and `-`.
- Registration validation is deliberately country-agnostic. Finnish-only
  registration syntax would reject valid dogs and parents in the source.
- Registration uniqueness is exact-text at the database level, so every import
  lookup and write must use the canonical normalized value. Lookup must also
  detect existing noncanonical case variants rather than assuming normalized
  exact lookup is sufficient.
- `DogColor` is a numeric canonical catalog with Finnish labels and
  `SELECTABLE`, `HIDDEN`, and `LEGACY_UNKNOWN` states.
- Manual admin assignment restricts hidden colors, but registry import is a
  distinct trusted-source policy. A uniquely matched official catalog color may
  be assigned by import regardless of UI selectability; ambiguous or unknown
  labels are not invented.
- New registration dates must use PostgreSQL `DATE` through
  `DateTime? @db.Date`.
- Existing `Dog.birthDate` remains a timestamp. Changing that existing column
  is outside this feature because repository architecture requires a separate
  date-semantics migration audit.
- Convert canonical birth dates to the repository's existing UTC-midnight
  representation for writes. Compare existing and incoming birth dates as
  canonical `YYYY-MM-DD` values using UTC date parts only; never pass them
  through local-time conversion.

### Transactions and audit

- Interactive transactions must use shared explicit transaction budgets.
- `WORKBOOK_IMPORT_WRITE_TX_CONFIG` currently permits a 10-second wait and a
  90-second transaction.
- `runInAuditContextDb` sets transaction-local actor user, actor session,
  source, intent, and request ID, but currently always uses the shorter admin
  transaction budget.
- PostgreSQL triggers already audit `Dog` and `DogRegistration` inserts,
  updates, and deletes with old/new JSON.
- Audit data is pruned after 12 months and omitted from normal database dumps.
  It is a mutation audit trail, not durable source provenance or import history.
- The repository has no serializable transaction or write-conflict retry
  pattern today.

### Admin UI and tests

- Admin pages use thin route entries under `app/(admin)/admin/**` and inherit
  the admin layout guard.
- The sidebar is currently a flat list and uses broad `startsWith` active
  matching. A nested `/admin/dogs/import` item requires segment-aware matching
  to avoid multiple active dog entries.
- Existing listing modules provide responsive desktop tables/mobile cards,
  summary cards, filter buttons, dialogs, and expandable-card patterns.
- There is no standardized tabs, accordion, or sticky-action component.
- Unit tests are co-located under `__tests__`; Playwright tests live in
  `tests/e2e`.
- Existing DB transaction tests mock Prisma and do not prove PostgreSQL
  rollback or trigger behavior. There is no established real-database test
  harness or authenticated admin Playwright fixture.

## Inspected Finnish workbook profile

The concrete workbook has one sheet, `Koirat`, with 338 populated source rows
and these headers in order:

1. `Rekisterinumero`
2. `Kennel`
3. `Nimi`
4. `Rotukoodi`
5. `Sukupuoli`
6. `Syntymäaika`
7. `Rekisteröity`
8. `Alkuperä`
9. `Alkuperämaa`
10. `Väri`
11. `Häntä`
12. `Rekisterinumero isä`
13. `Rekisterinumero emä`

Important source facts:

- All 338 rows have registration, name, breed `161`, sex, origin type, sire,
  and dam.
- Sex values are `uros` and `narttu`.
- Birth date is absent on four `Sukupuukoira` rows.
- Registration date is absent on seven rows.
- Kennel is absent on 47 rows.
- Origin country is absent on 315 rows and is mainly relevant to import dogs.
- Color is absent on seven rows. All currently populated color labels map to
  known canonical selectable colors when compared case-insensitively.
- Tail is empty on all current rows.
- There are no duplicate normalized primary registrations and no invalid,
  missing, self-parent, or same-parent registrations in the inspected file.
- There are 164 unique parent registrations that are not full source rows in
  this workbook.
- Dates are Excel serial values in the 1900 date system with no time component.
- The worksheet used range incorrectly extends to row 1,048,576 because of
  formatting. Parsing must derive the last populated row and must not trust the
  worksheet dimension or count formatting-only rows.

These observations were inspected on 2026-09-22 from the provided workbook and
are planning evidence, not a permanent parser contract. Implementation tests
must recreate the relevant shapes in sanitized in-memory fixtures.

## Database changes

### Phase-one schema additions

Add nullable fields:

```text
Dog.originTypeText       String?
Dog.originCountryText    String?
Dog.tailText             String?
DogRegistration.registeredOn  DateTime? @db.Date
```

Rationale:

- Origin and tail values are source text, not stable application enums yet.
- `originCountryText` preserves the Finnish registry value without pretending
  it is a canonical ISO country code.
- Registration date belongs to the registration, not the dog.
- `registeredOn` is a calendar date backed by `@db.Date`, not a UTC timestamp.
  Any new database field introduced for a UTC date-time instant must use an
  explicit `Utc` suffix, for example `processedUtc`.
- Nullable additions preserve all existing callers and records.

Do not add an import-run table, import-policy table, raw JSON field, or
field-level provenance model in phase one.

### Existing fields and write rules

- Write `Kennel` to `Dog.breederNameText`.
- Do not create, change, or clear `Dog.breederId` during import.
- Resolve `Väri` against normalized `DogColor.nameFi`; never create a color.
- Set new primary registration rows to source `FINNISH_KENNEL_CLUB`.
- Preserve an existing registration row's `source`; it records how that row was
  originally created, not the latest corroborating source.
- Do not modify unrelated dog fields such as owners, titles, EK number, note,
  or secondary registrations.

## Canonical import architecture

The phase-one processing path is:

```text
Finnish XLSX parser
  -> Finnish source-row normalization
  -> canonical dog-import rows
  -> structural and source validation
  -> database state lookup
  -> difference/issue detection
  -> effective import policy
  -> proposed import plan and preview digest
  -> reviewed preview
  -> apply re-evaluation
  -> audited transactional stale-state check and write
```

### Module seam

The canonical normalized row is the seam between source-specific parsing and
source-neutral import evaluation. Phase one needs one concrete Finnish Kennel
Club XLSX parser, not a source-adapter registry or abstract interface. A future
Swedish Kennel Club parser becomes the second adapter by returning the same
canonical row type.

The source-specific orchestration parses bytes into canonical rows. The
source-neutral evaluator accepts canonical rows plus backend state/policy
context and returns the complete proposed plan, issues, counts, and digest. UI
and apply code must not reconstruct policy decisions.

### Proposed canonical row

```ts
type CanonicalDogImportRow = {
  source: "FINNISH_KENNEL_CLUB";
  sourceRowNumber: number;
  registrationNo: string | null;
  name: string | null;
  sex: "MALE" | "FEMALE" | null;
  birthDate: string | null; // YYYY-MM-DD
  registeredOn: string | null; // YYYY-MM-DD
  breederNameText: string | null;
  originTypeText: string | null;
  originCountryText: string | null;
  colorName: string | null;
  tailText: string | null;
  sireRegistrationNo: string | null;
  damRegistrationNo: string | null;
};
```

The canonical row carries normalized values only. Raw workbook rows remain in
request memory for diagnostics and are discarded after the request.

### Evaluation stages

1. Validate file extension, compressed size, ZIP expansion limits,
   parseability, worksheet, and headers.
2. Determine the last row containing a cell value by sparse populated-cell
   inspection and ignore empty/formatted rows beyond it.
3. Convert Excel date serials using workbook 1900/1904 metadata.
4. Normalize every populated source row to the canonical type.
5. Detect structural/source issues and normalized duplicate registrations.
6. Load all referenced dog registrations case-insensitively, canonicalize the
   returned keys, and block if multiple stored rows collide after
   normalization. Load dog snapshots, linked breeder names, parent identities,
   color catalog rows, and historical link candidates in batched queries.
7. Detect differences and integrity facts without deciding severity in the UI.
8. Resolve the backend effective policy and convert facts to issues and planned
   actions.
9. Build deduplicated reference-only parent proposals after valid full source
   rows have been resolved.
10. Classify each source row as `CREATE`, `UPDATE`, `UNCHANGED`, or `BLOCKED`.
11. Produce deterministic counts and a preview digest.

Preview and apply call the same evaluator. Apply never accepts a client-built
operation plan.

## Proposed module locations

```text
packages/contracts/admin/dogs/import/
  types.ts
  preview-finnish-kennel-club-import.ts
  apply-finnish-kennel-club-import.ts
  index.ts

packages/server/admin/dogs/import/
  preview-finnish-kennel-club-import.ts
  apply-finnish-kennel-club-import.ts
  index.ts
  internal/model/*
  internal/sources/finnish-kennel-club/*
  internal/issues/*
  internal/policy/*
  internal/runtime/evaluate-dog-import-rows.ts
  internal/parents/*
  internal/preview/*

packages/db/admin/dogs/import/
  load-dog-import-state.ts
  apply-dog-import-plan.ts
  index.ts

apps/web/app/api/admin/dogs/import/finnish-kennel-club/preview/route.ts
apps/web/app/api/admin/dogs/import/finnish-kennel-club/apply/route.ts
apps/web/app/(admin)/admin/dogs/import/page.tsx

packages/api-client/admin/dogs/import/finnish-kennel-club/*
apps/web/queries/admin/dogs/import/*
apps/web/hooks/admin/dogs/import/use-admin-dog-import-flow.ts
apps/web/lib/admin/dogs/import/*
apps/web/components/admin/dogs/import/*
```

Public exports must flow through feature `index.ts` files. Internal parser,
policy, issue, and preview helpers remain private.

These admin-scoped modules are independent of the removable one-shot legacy
import code under `packages/server/imports/**`,
`packages/server/scripts/imports/**`, and `packages/db/imports/**`. The new dog
registry import must not import from, re-export through, or otherwise depend on
those legacy directories, so they can be deleted without affecting this
feature. The `admin/dogs/import` location instead follows the maintained
`admin/shows/import` feature structure.

## File transport and authorization

### Phase-one transport

Use authenticated multipart route handlers for preview and apply:

```text
POST /api/admin/dogs/import/finnish-kennel-club/preview
POST /api/admin/dogs/import/finnish-kennel-club/apply
```

The route identifies the registry source; callers do not submit a free-form
source selector. The admin page remains `/admin/dogs/import`. A future registry
gets sibling source-specific routes while sharing the page workflow and
source-neutral evaluator.

Reasons:

- The workbook is binary multipart data.
- Server Actions currently have a lower body limit than the existing workbook
  feature limit.
- Route handlers are an allowed stronger HTTP reason under repository
  architecture.

Use a 10 MiB compressed-file feature limit in both client guidance and server
enforcement. The inspected Finnish workbook is about 28 KiB, leaving ample
growth without adopting the show importer's unsupported 50 MiB limit.

The route must authenticate before parsing the multipart body, reject an
oversized `Content-Length` when available, validate `File.size`, require
`.xlsx`, and map oversize input to HTTP 413. Because `request.formData()` may
buffer before `File.size` is available, deployment must also enforce a request
limit at the Azure/reverse-proxy boundary; the application check alone is not a
streaming resource guard. Parseability remains authoritative; MIME type alone
is not.

Before full workbook evaluation, enforce XLSX ZIP and parser limits:

- at most 50 MiB total uncompressed ZIP entries;
- at most 20 MiB for any one ZIP entry;
- reject suspicious compression ratios above 100:1;
- process only the first worksheet and warn if additional sheets exist;
- at most 10,000 populated source rows;
- at most 64 columns and 100,000 populated cells.

`SOURCE_RESOURCE_LIMIT_EXCEEDED` is a top-level blocking failure. These bounds
protect parsing from compressed workbooks and malicious/inflated worksheet
ranges. Implementation may add a focused ZIP preflight dependency because
`xlsx` alone does not provide a pre-decompression request guard.

Both route and server use-case enforce admin access. The route supplies current
user, session ID, and request ID. The server use-case performs the canonical
`requireAdmin` check.

The API client must preserve browser-generated multipart boundaries. Extend
the shared request helper so it does not set `Content-Type: application/json`
for `FormData`, with focused regression tests.

## Header and row requirements

### Structurally required columns

These headers must exist because they define a full normal dog and its pedigree:

- `Rekisterinumero`
- `Nimi`
- `Rotukoodi`
- `Sukupuoli`
- `Syntymäaika`
- `Alkuperä`
- `Rekisterinumero isä`
- `Rekisterinumero emä`

`Syntymäaika` is structurally required but may be empty per row because the
inspected source contains valid pedigree dogs without a known birth date.

### Structurally optional columns

- `Kennel`
- `Rekisteröity`
- `Alkuperämaa`
- `Väri`
- `Häntä`

A missing optional header produces one `OPTIONAL_COLUMN_MISSING` info issue and
does not block import. An unknown populated column produces one
`UNSUPPORTED_COLUMN_IGNORED` warning so source format changes are visible.
Duplicate headers and populated unnamed columns are blockers.

### Required per source row

- valid normalized `Rekisterinumero`
- non-empty `Nimi`
- `Rotukoodi` equal to textual or numeric `161`
- recognized `Sukupuoli` (`uros` or `narttu`, case-insensitive)
- non-empty `Alkuperä`
- valid non-placeholder sire registration
- valid non-placeholder dam registration

Birth date and all structurally optional fields may be empty. Populated dates
must be valid calendar dates. A source row is not made `REFERENCE_ONLY` merely
because optional data is absent.

## Issue, policy, and resolution model

### Stable issue shape

```ts
type DogImportIssueSeverity = "BLOCKER" | "WARNING" | "INFO";

type DogImportResolution =
  | "AUTO_UPDATE"
  | "KEEP_EXISTING"
  | "BLOCK"
  | "CREATE_REFERENCE"
  | "IGNORE";

type DogImportIssue = {
  code: DogImportIssueCode;
  severity: DogImportIssueSeverity;
  field: DogImportField | null;
  registrationNo: string | null;
  sourceRowNumber: number | null;
  currentValue: string | number | boolean | null;
  incomingValue: string | number | boolean | null;
  message: string;
  resolution: DogImportResolution;
  overridable: boolean;
};
```

Dates in issues are ISO date strings. Schema-wide issues use null row,
registration, and field where appropriate. Codes and structured values are the
stable contract; `message` is human-readable fallback/context. The web maps
codes and fields to Finnish/Swedish labels and never infers severity from code
names.

### Separation of responsibilities

- Detection reports source/schema facts and current-vs-incoming differences.
- Policy assigns severity, overridability, and resolution.
- Plan construction follows resolution and calculates `applyAllowed`.
- The backend returns the effective decision. UI only renders it.
- Apply resolves the same backend policy again and rejects a changed digest.

### Effective policy and future precedence

Phase one defines a strongly typed `DOG_IMPORT_POLICY_DEFAULTS` and
`policyVersion` in server code. It uses those defaults directly; it does not
implement override input or persistence before an override source exists.

Keep rule identifiers, overridability metadata, and plan construction shaped so
the first future resolver can apply this precedence:

```text
code defaults
  -> persistent organization/admin settings (future)
  -> current import-session overrides (first future enhancement)
```

Only rules explicitly typed as overridable may then be changed. Future
persistent or session input for a non-overridable rule must be rejected, not
silently used. The phase-one default policy and policy version contribute to
the preview digest.

## Phase-one policy matrix

`Apply` means whether the whole import may proceed while that issue exists.
`Update` describes the affected field/record action if apply proceeds.

| Condition                                                       | Stable issue code                  | Default severity | Apply | Resolution/update                  |    Future override |
| --------------------------------------------------------------- | ---------------------------------- | ---------------: | ----: | ---------------------------------- | -----------------: |
| Empty or unreadable source file / no source data                | `SOURCE_FILE_UNREADABLE`           |          BLOCKER |    No | BLOCK                              |                 No |
| Source file exceeds file/parser/row/cell limits                 | `SOURCE_RESOURCE_LIMIT_EXCEEDED`   |          BLOCKER |    No | BLOCK                              |                 No |
| Additional worksheets exist                                     | `ADDITIONAL_SHEETS_IGNORED`        |          WARNING |   Yes | Parse first worksheet only         |                 No |
| Required header missing                                         | `REQUIRED_COLUMN_MISSING`          |          BLOCKER |    No | BLOCK                              |                 No |
| Duplicate header                                                | `DUPLICATE_COLUMN`                 |          BLOCKER |    No | BLOCK                              |                 No |
| Populated unnamed column                                        | `UNNAMED_COLUMN_WITH_DATA`         |          BLOCKER |    No | BLOCK                              |                 No |
| Optional header missing                                         | `OPTIONAL_COLUMN_MISSING`          |             INFO |   Yes | IGNORE                             |                 No |
| Unknown populated column                                        | `UNSUPPORTED_COLUMN_IGNORED`       |          WARNING |   Yes | IGNORE                             |                Yes |
| Required row value missing                                      | `REQUIRED_VALUE_MISSING`           |          BLOCKER |    No | BLOCK                              |                 No |
| Invalid primary registration                                    | `REGISTRATION_INVALID`             |          BLOCKER |    No | BLOCK                              |                 No |
| Registration exceeds 40 characters                              | `REGISTRATION_TOO_LONG`            |          BLOCKER |    No | BLOCK                              |                 No |
| Existing registrations collide after canonical normalization    | `REGISTRATION_CANONICAL_COLLISION` |          BLOCKER |    No | BLOCK                              |                 No |
| Registration already owned by an incompatible identity          | `REGISTRATION_OWNERSHIP_CONFLICT`  |          BLOCKER |    No | BLOCK                              |                 No |
| Duplicate normalized registration in source file                | `DUPLICATE_SOURCE_REGISTRATION`    |          BLOCKER |    No | BLOCK                              |                 No |
| Different workbook registrations resolve to the same dog        | `MULTIPLE_SOURCE_ROWS_SAME_DOG`    |          BLOCKER |    No | BLOCK                              |                 No |
| Breed code is not `161`                                         | `BREED_NOT_BEAGLE`                 |          BLOCKER |    No | BLOCK                              |                 No |
| Unknown sex token                                               | `DOG_SEX_INVALID`                  |          BLOCKER |    No | BLOCK                              |                 No |
| Dog name exceeds 120 characters                                 | `DOG_NAME_TOO_LONG`                |          BLOCKER |    No | BLOCK                              |                 No |
| Material name difference                                        | `DOG_NAME_CONFLICT`                |          BLOCKER |    No | BLOCK                              |                Yes |
| Name differs only by case/spacing/Unicode form                  | `DOG_NAME_FORMAT_DIFFERS`          |             INFO |   Yes | KEEP_EXISTING                      |                Yes |
| Sex difference                                                  | `DOG_SEX_CONFLICT`                 |          BLOCKER |    No | BLOCK                              |                Yes |
| Invalid populated birth date                                    | `DOG_BIRTH_DATE_INVALID`           |          BLOCKER |    No | BLOCK                              |                 No |
| Birth-date difference                                           | `DOG_BIRTH_DATE_CONFLICT`          |          BLOCKER |    No | BLOCK                              |                Yes |
| Sire difference                                                 | `DOG_SIRE_CONFLICT`                |          BLOCKER |    No | BLOCK                              |                Yes |
| Dam difference                                                  | `DOG_DAM_CONFLICT`                 |          BLOCKER |    No | BLOCK                              |                Yes |
| Recognized color differs                                        | `DOG_COLOR_DIFFERS`                |          WARNING |   Yes | AUTO_UPDATE                        |                Yes |
| Color label is unknown or ambiguous                             | `DOG_COLOR_UNRESOLVED`             |          WARNING |   Yes | KEEP_EXISTING; new dog gets null   |                Yes |
| Kennel text differs and no conflicting breeder link exists      | `DOG_BREEDER_TEXT_DIFFERS`         |          WARNING |   Yes | AUTO_UPDATE text only              |                Yes |
| Kennel text conflicts with linked breeder name                  | `DOG_BREEDER_LINK_CONFLICT`        |          WARNING |   Yes | KEEP_EXISTING text and `breederId` |                Yes |
| Invalid populated registration date                             | `DOG_REGISTRATION_DATE_INVALID`    |          BLOCKER |    No | BLOCK                              |                 No |
| Registration date differs                                       | `DOG_REGISTRATION_DATE_DIFFERS`    |          WARNING |   Yes | AUTO_UPDATE                        |                Yes |
| Origin type differs                                             | `DOG_ORIGIN_TYPE_DIFFERS`          |          WARNING |   Yes | AUTO_UPDATE                        |                Yes |
| Origin country differs                                          | `DOG_ORIGIN_COUNTRY_DIFFERS`       |          WARNING |   Yes | AUTO_UPDATE                        |                Yes |
| Tail text differs                                               | `DOG_TAIL_DIFFERS`                 |          WARNING |   Yes | AUTO_UPDATE                        |                Yes |
| Incoming optional value is empty and DB has a value             | `SOURCE_EMPTY_PRESERVED`           |             INFO |   Yes | KEEP_EXISTING                      |                 No |
| Incoming optional value and DB value are both empty             | No issue                           |                - |   Yes | No change                          |                  - |
| DB value empty, valid incoming value present                    | No issue                           |                - |   Yes | Set incoming value                 |                  - |
| Parent registration invalid                                     | `PARENT_REGISTRATION_INVALID`      |          BLOCKER |    No | BLOCK                              |                 No |
| Parent registration is a placeholder                            | `PARENT_REGISTRATION_PLACEHOLDER`  |          BLOCKER |    No | BLOCK                              |                 No |
| Parent registration used as both sire and dam                   | `PARENT_ROLE_AMBIGUOUS`            |          BLOCKER |    No | BLOCK                              |                 No |
| Child is its own parent                                         | `PARENT_SELF_REFERENCE`            |          BLOCKER |    No | BLOCK                              |                 No |
| Sire and dam resolve to the same dog                            | `PARENT_SAME_IDENTITY`             |          BLOCKER |    No | BLOCK                              |                 No |
| Existing parent sex conflicts with role                         | `PARENT_SEX_CONFLICT`              |          BLOCKER |    No | BLOCK                              |                 No |
| Full source-row parent's sex conflicts with its referenced role | `PARENT_SOURCE_SEX_CONFLICT`       |          BLOCKER |    No | BLOCK                              |                 No |
| Child depends on a blocked full source parent row               | `PARENT_SOURCE_ROW_BLOCKED`        |          BLOCKER |    No | BLOCK                              |                 No |
| Valid parent is missing                                         | `REFERENCE_PARENT_PLANNED`         |             INFO |   Yes | CREATE_REFERENCE                   | Yes, to BLOCK only |
| Existing reference-only dog appears as a valid full row         | `REFERENCE_DOG_PROMOTED`           |             INFO |   Yes | AUTO_UPDATE status to NORMAL       |                 No |
| Promoted reference dog's name is its registration fallback      | `REFERENCE_FALLBACK_NAME_REPLACED` |             INFO |   Yes | AUTO_UPDATE real name              |                 No |
| Promoted reference dog's sex is UNKNOWN                         | `REFERENCE_UNKNOWN_SEX_FILLED`     |             INFO |   Yes | AUTO_UPDATE source sex             |                 No |
| Reviewed source-file bytes changed                              | `SOURCE_FILE_CHANGED`              |          BLOCKER |    No | Re-preview                         |                 No |
| DB state/effective plan changed after preview                   | `PREVIEW_STALE`                    |          BLOCKER |    No | Re-preview                         |                 No |

### Permanently non-overridable integrity rules

Keep these non-overridable because no field preference can make them safe:

- malformed workbook structure;
- missing required identity values;
- invalid or duplicate normalized primary registrations;
- registration ownership conflicts;
- non-Beagle rows;
- invalid dates or sex tokens;
- invalid, placeholder, self, same-identity, or role-ambiguous parents;
- changed workbook bytes or stale database state;
- blank-value clearing prohibition;
- promotion of the same registration identity rather than duplicate creation.

Name, sex, birth-date, and existing-parent differences are blockers by default
but may support an explicit future source-vs-current resolution choice. Phase
one provides no override mechanism.

## Clearing semantics

Phase one has no clear marker. A blank or absent optional source value means
"no proposed change":

- Existing non-empty database value: preserve it and emit
  `SOURCE_EMPTY_PRESERVED` info.
- Existing empty database value: remain empty without an issue.
- New dog: store null.
- Required value: block as `REQUIRED_VALUE_MISSING`.

Apply must construct partial updates from the plan. It must never map source
blank values to Prisma `null` for an existing optional field. Future explicit
clearing requires a new source/UI concept and policy rule; it cannot be enabled
by changing the severity of this rule.

## Reference-only parent behavior

### Creation eligibility

A missing parent may be generated only when:

- the normalized parent registration is valid and not a placeholder;
- it is referenced by at least one otherwise valid full source row;
- it does not appear as both sire and dam in the evaluated workbook;
- it does not resolve to the child or to the other parent;
- no full source row or existing registration owns that identity.

Minimum generated data:

- normalized primary registration;
- fallback name equal to that registration;
- `MALE` when used only as sire or `FEMALE` when used only as dam;
- status `REFERENCE_ONLY`;
- registration source `FINNISH_KENNEL_CLUB`.

Create full source-row dogs first in the logical plan, then deduplicate and
create only still-missing parents, then write parent links. The new writer must
accept the transaction client; the legacy helper uses global Prisma and cannot
be reused unchanged.

### Existing and promoted identities

- Reuse existing registrations regardless of dog status.
- Never demote a `NORMAL` dog because it appears only as a parent.
- An existing parent's sex must match its role; phase one blocks rather than
  silently changing it.
- A valid full source row for an existing `REFERENCE_ONLY` dog reuses the same
  dog and registration, applies normal-row validation/policy, and promotes it
  to `NORMAL` in the update plan.
- Promotion may replace the internal registration-number name fallback with the
  real source name, fill `UNKNOWN` sex from the full row, and fill null optional
  fields without conflict. A different known name, known sex, birth date, or
  parent remains subject to the normal blocker policy.
- Promotion counts as one updated source row, not one created dog.
- Generated reference parents are additional records, not source rows.

## Counts and terminology

### Source-row outcomes

`sourceRowCount` is the number of non-empty data rows after the header. It
excludes formatting-only rows and generated parents.

Every source row has exactly one outcome:

- `createdDogCount`: row creates one `NORMAL` dog.
- `updatedDogCount`: row changes at least one persisted dog or registration
  field, including `REFERENCE_ONLY -> NORMAL` promotion.
- `unchangedRowCount`: row causes no dog or registration write.
- `blockedRowCount`: row has at least one blocker.

The invariant is:

```text
sourceRowCount = createdDogCount + updatedDogCount
               + unchangedRowCount + blockedRowCount
```

If apply is allowed, `blockedRowCount` is zero. There is no `SKIPPED` successful
outcome in phase one; invalid and non-Beagle rows are blocked, not skipped.

### Issues and generated records

- `warningIssueCount` and `blockerIssueCount` count issues, not rows.
- `warningRowCount` and `blockerRowCount` count distinct affected source rows.
- Schema-wide issues are counted as issues but not affected rows.
- One row may contribute multiple issues, so issue counts do not participate in
  the source-row outcome equation.
- `referenceParentCreateCount` counts deduplicated generated
  `REFERENCE_ONLY` dogs and is separate from `sourceRowCount`.
- Because multiple source rows resolving to the same dog are blocked, created
  and updated source-row counts also equal distinct normal dog record counts in
  an applicable plan.
- Completion shows created, updated, unchanged, and reference-parent counts.
  It does not show skipped.

## Preview/apply consistency

The exact reviewed interpretation must determine apply.

### Preview response

Preview returns:

- `sourceFileSha256`: digest of uploaded bytes;
- `previewDigest`: digest of normalized rows, effective policy version,
  issues/resolutions, proposed operations, and observed touched-record
  fingerprints;
- effective policy metadata needed for display;
- source-row outcomes, field comparisons, issues, generated-parent proposals,
  and counts;
- backend-computed `applyAllowed`.

Touched-record fingerprints include dog/registration IDs and `updatedAt`,
normalized registration ownership, matched color code/name/status/`updatedAt`,
linked breeder identity/name, and the exact currently unlinked show/trial entry
IDs proposed for historical linking. Build digests from deterministic canonical
serialization with stable ordering. Do not hash filenames or locale-dependent
messages as policy evidence.

### Apply request and revalidation

Apply submits the source file again with the reviewed `sourceFileSha256` and
`previewDigest`.

The backend:

1. hashes and parses the submitted source file again;
2. rejects changed bytes as `SOURCE_FILE_CHANGED`;
3. re-runs the same evaluator and effective policy against current DB state;
4. rejects a changed plan as `PREVIEW_STALE`;
5. enters the audited transaction;
6. reloads and verifies every touched dog, registration, color, breeder, and
   historical-entry fingerprint before writing;
7. applies only the server-generated plan.

The browser changing selection clears preview and confirmation state. Filename
equality is never considered sufficient.

## Transaction and concurrency strategy

### Transaction helper

Extend the existing audit transaction helper to accept explicit transaction
options while preserving its current default. Add a dog-registry-import
transaction configuration based on the existing workbook budget and PostgreSQL
`Serializable` isolation.

The entire write sequence uses one audited interactive transaction:

1. recheck touched registration ownership and dog fingerprints;
2. create/promote/update full source-row dogs;
3. create deduplicated missing reference parents;
4. write sire/dam links;
5. update registration dates and other planned values;
6. link only the exact historical show/trial entry IDs included in the reviewed
   plan for created or promoted dogs, guarded by `dogId IS NULL`;
7. return write counts.

Use deterministic registration ordering and batched/set-based writes where
possible. Do not call normal create/update use-cases once per row because each
would open a separate transaction and would reconcile breeders.

### Failure behavior

- Any row, relation, constraint, or audit-trigger failure rolls back all import
  dog, registration, parent, and historical-link writes.
- A referenced-parent creation failure rolls back the entire import.
- A stale fingerprint returns HTTP 409 and requires review again.
- A unique registration race returns the same stale/re-preview outcome rather
  than a generic server error.
- Serializable write conflicts receive a small bounded retry around the whole
  recheck-and-write transaction. After retries, return a retryable 409.
- Transaction acquisition/expiry maps through the existing timeout classifier
  to an explicit operational error.

If two admins apply overlapping imports, at most one reviewed plan commits.
The other is rejected as stale or by the serializable/unique guard and must
preview current state again. Applying the same workbook after a successful
import should preview as unchanged rather than duplicate dogs.

## Audit and provenance decision

### Mutation audit

Apply uses:

```text
source: WEB
intent: IMPORT_FINNISH_DOG_REGISTRATIONS
actorUserId: current admin
actorSessionId: current session
requestId: current request ID
```

Existing triggers then record old/new `Dog` and `DogRegistration` rows. Preview
does not open an audit transaction and must not produce dog-data audit events.

### Provenance and retention

Phase one provenance is intentionally limited:

- New registration rows identify `FINNISH_KENNEL_CLUB` as their source.
- Audit events explain actual field mutations for the audit-retention period.
- Structured logs may include filename, workbook hash, aggregate counts, and
  issue-code counts, but never raw rows or workbook contents.
- The uploaded workbook is buffered only for the current preview/apply request
  and discarded afterward. It is not temporarily or durably stored by the
  application.

This does not provide durable field-level source provenance, unchanged-row
history, or replay. Those require a future import-run/source-artifact model.
Do not claim that the audit table provides permanent import history.

## UI and navigation

### Navigation

Add the thin page route:

```text
/admin/dogs/import
```

Keep the current dog search at `/admin/dogs`; do not add a dog dashboard. Add an
outline `Rekisteröintien tuonti` action beside `Lisää koira` in the existing dogs
management header; do not add a dedicated import sidebar item. Change active matching to exact/segment-aware matching
so `/admin/dogs`, `/admin/dogs/import`, `/admin/dogs/diseases`, and
`/admin/dogs/virtual-pairing` do not activate one another accidentally.

Future history may use `/admin/dogs/imports` and
`/admin/dogs/imports/[importId]`, but those routes and navigation items are not
created in phase one.

### Workflow

Use the supplied prototype direction within the existing admin shell:

1. `Lataa tiedosto`
2. `Tarkista`
3. `Vahvista`
4. completion state

The three numbered steps describe decisions; completion replaces the third
step's content after a successful apply.

### Upload

- Show source `Suomen koirarekisteri`, `.xlsx`, 10 MiB maximum, and required
  column names.
- Provide file selection/drop area and selected filename/size.
- Replacing the file invalidates all review/confirmation state.
- The primary action is `Tarkista tiedosto`.

### Review

Show:

- source rows;
- new dogs;
- updates;
- unchanged rows;
- warning issues and affected rows;
- blocker issues and affected rows;
- generated reference-only parents.

Provide filters for blockers, warnings, new, updates, and unchanged, plus
registration-number search and client-side pagination. Each row shows
registration number and Excel row. Expandable details show only changed fields
with current and incoming values plus structured issues.

Apply/continue is disabled when backend `applyAllowed` is false. The workbook
replacement action remains available. Do not repeat the same full warning in a
banner, every row, and the sticky bar: use one page-level state banner, concise
row issues, and a compact sticky action summary.

### Confirmation and apply

Use the dedicated third step instead of an additional confirmation modal. It
summarizes filename, workbook hash abbreviation, creates, updates, unchanged
rows, warnings, and reference parents, and states that blank source values will
not clear stored data.

Actions:

- `Palaa tarkistukseen`
- `Tuo rekisteritiedot`

The apply button submits the exact reviewed digest. A stale response returns to
review with guidance to validate again. Disable repeat apply after success.

### Completion

Show created, updated, unchanged, and generated reference-parent counts, plus:

- `Siirry koiriin`
- `Tuo toinen tiedosto`

Use localized Finnish and Swedish UI messages even though the phase-one source
is Finnish. Use domain wording such as `Vain sukupuuhun luodut` in the UI;
`REFERENCE_ONLY` may appear only as secondary technical context.

## Test plan

### Server unit tests

Co-locate tests under `packages/server/admin/dogs/import/**/__tests__`.

Workbook and source adapter:

- real in-memory XLSX parsing;
- first worksheet/date-system handling;
- formatting-only rows and inflated worksheet dimensions;
- empty workbook and unreadable workbook;
- compressed/uncompressed ZIP, compression-ratio, worksheet, row, column, and
  populated-cell limits;
- exact, normalized, missing, duplicate, unnamed, and unsupported headers;
- required versus optional headers;
- numeric and textual breed `161`;
- Finnish sex tokens and invalid tokens;
- Excel serial dates, 1900/1904 systems, invalid dates, and missing optional
  dates;
- registration normalization, foreign formats, placeholders, and length;
- duplicate normalized workbook registrations;
- canonical collisions in existing stored registrations;
- different source registrations resolving to the same existing dog;
- color label matching, case normalization, ambiguity, and unknown labels.

Issue, policy, and plan:

- every phase-one policy-matrix row;
- separation of detection from severity/resolution;
- typed default policy metadata, policy version, and non-overridable markers;
- no silent clearing;
- create/update/unchanged/blocked classification;
- material versus formatting-only name differences;
- deterministic issue ordering, counts, affected-row counts, and digest;
- the source-row count invariant;
- no skipped outcome.

Reference parents:

- missing valid sire/dam creation plan;
- deduplication across children;
- role-inferred sex;
- invalid, placeholder, ambiguous-role, self, same-parent, and sex-conflict
  blockers;
- full source row wins over generated parent proposal;
- existing normal/reference-only reuse;
- `REFERENCE_ONLY -> NORMAL` promotion without a duplicate identity;
- existing normal dogs are never demoted.

Use-cases:

- admin authorization in preview and apply;
- preview performs no write call;
- apply refuses blockers;
- changed source-file hash;
- changed preview digest/current DB snapshot;
- warning-allowed apply;
- timeout, serialization, unique-conflict, and generic error mapping;
- audit context forwarded with user, session, source, intent, and request ID.

### DB integration tests

A real PostgreSQL-backed test is required for guarantees mocked transaction
tests cannot prove. Add a focused isolated test setup before claiming these
behaviors complete:

- create normal dogs and generated parents in one transaction;
- update only planned fields and preserve blank-source fields;
- preserve `breederId` while updating `breederNameText`;
- preserve both breeder text and link when the incoming text conflicts with a
  linked breeder;
- promote a reference-only dog;
- link historical show/trial entries for created/promoted dogs;
- inject a failure after earlier writes and verify complete rollback;
- verify generated parents and audit events also roll back;
- verify actual audit rows contain actor/session/source/intent/request ID;
- verify unique registration races and stale `updatedAt`/ownership guards;
- verify serializable retry and eventual 409 behavior.

The test database must follow repository environment-safety guidance and must
never point at shared staging or production data.

### Web and transport tests

- multipart request helper preserves `FormData` content type boundary;
- route authentication before body parsing;
- extension, empty-file, malformed-file, and 10 MiB/413 handling;
- route-to-server user/session/request context;
- workflow state resets when replacing a workbook;
- step transitions and dedicated confirmation step;
- blocker disables confirmation/apply;
- category filters, registration search, expansion, pagination, and responsive
  row/card presentation;
- issue severity rendered from backend field, not issue-code naming;
- stale apply returns to review;
- successful apply cannot be repeated;
- Finnish and Swedish message-key completeness;
- segment-aware sidebar active state.

### Playwright E2E

The repository currently lacks an authenticated admin fixture. After adding a
minimal isolated fixture, cover two high-value flows:

1. Upload a valid workbook, review counts, confirm, apply, and see completion.
2. Upload a blocked workbook, verify apply is unavailable, replace it with a
   corrected workbook, and verify the old preview is invalidated.

Keep parser and policy matrices in unit tests rather than multiplying E2E cases.

## Phased implementation tasks

Execute in dependency order. Each task includes targeted tests and stops at its
own reviewable interface.

1. **Schema foundation**
   - Add nullable origin/tail/registration-date fields and migration.
   - Regenerate Prisma client.
   - Add schema-level persistence tests.

2. **Canonical model and Finnish source adapter**
   - Define internal canonical row and source constants.
   - Parse workbook/header/date/row data safely, including inflated used range.
   - Normalize registrations, names, sex, dates, and source text.

3. **Issue and effective-policy module**
   - Define stable issue codes, fields, severity, resolution, and defaults.
   - Implement detection-to-policy separation and non-overridable guards.
   - Implement clearing semantics and field comparison rules.
   - Add shared preview/apply contract types and exports.

4. **Lookup, plan, and reference-parent evaluation**
   - Add batched DB state loader.
   - Build source-row outcomes, parent proposals, promotion behavior, counts,
     fingerprints, and deterministic digests.
   - Add preview use-case with server-layer authorization and logging.

5. **Audited atomic apply**
   - Extend audit transaction options.
   - Add serializable registry-import transaction/retry handling.
   - Re-evaluate source data/digest, recheck state, write the plan, and link
     historical entries.
   - Add real rollback/audit integration coverage.

6. **Multipart transport**
   - Make shared API request handling `FormData`-safe.
   - Add authenticated preview/apply route handlers, ZIP/parser limits, and
     feature API-client mutations.

7. **Admin workflow UI**
   - Add route, i18n, workflow hook, upload/review/confirm/completion modules,
     responsive results, filters, and sticky action summary.
   - Add the dogs-header import action and segment-aware active matching.

8. **End-to-end validation and durable documentation**
   - Add the two Playwright flows when the isolated admin fixture is available.
   - Update the nearest feature documentation and `CHANGELOG.md` when behavior
     ships.
   - Run targeted package checks, then full test/typecheck/lint without cycle
     lint before completion.

## Future extension points

### Swedish source

Add `internal/sources/swedish-kennel-club/*` with an MHTML parser returning
`CanonicalDogImportRow`, source-specific preview/apply entrypoints, and sibling
`/api/admin/dogs/import/swedish-kennel-club/*` routes. Extend the canonical
source union with `SWEDISH_KENNEL_CLUB`. Reuse the evaluator, policy, preview
model, transaction writer, and page workflow. Missing source fields remain null
and follow the same no-clearing rule. Do not convert Swedish MHTML into the
Finnish workbook shape or share source-column parsing between adapters.

### Session and persistent policy configuration

First add per-import/session overrides for rules already marked overridable.
Later add organization/admin settings and feed them into the same effective
policy resolver. The backend remains the only policy authority.

### Import history and provenance

If administrators need history, replay, raw evidence, or durable per-field
source attribution, introduce a dog-import-specific run/source model and then
add:

```text
/admin/dogs/imports
/admin/dogs/imports/[importId]
```

Do not retrofit dog registry history into the one-shot legacy import phases
without a separate design decision.

## Resolved phase-one product choices

- Every valid full workbook row, including `Sukupuukoira`, becomes or remains
  `NORMAL`. Only generated missing parents are `REFERENCE_ONLY`. Status is not
  inferred from missing optional data.
- Uploaded files are discarded after each request. Phase one accepts
  source-at-registration plus the existing retention-limited mutation audit;
  permanent source-row/file proof is deferred with import history.

## Principal implementation risks

- The current broad registration validator accepts more than registry-specific
  identifiers; placeholder detection must remain source-aware without rejecting
  valid international parents.
- Database uniqueness is exact-text, so any unnormalized write path can still
  create case variants. The import must normalize before every lookup/write.
- The current admin dog write adapters reconcile breeders and therefore cannot
  be reused directly for this import.
- Existing legacy reference-parent creation is not transaction-bound and does
  not implement repeatable import promotion semantics.
- Serializable/retry and real-DB integration testing are new repository
  capabilities and need careful, focused introduction.
- Audit volume can be high because every dog and registration write fires a
  trigger; batching and the import transaction budget need production-sized
  verification.
- The current sidebar active matcher is unsafe for nested dog routes.
- Upstream Azure request-size limits are not documented in the repository and
  must be confirmed before deployment, even with a 10 MiB application limit.
- Existing `Dog.birthDate` timestamp semantics remain a known mismatch with the
  date-only architecture rule; this feature must avoid expanding that migration
  scope.
