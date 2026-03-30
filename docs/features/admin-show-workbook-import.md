# Admin Show Workbook Import

This document describes the validation and preview steps for the new admin show
workbook import flow. `/admin/shows` acts as the module hub, and the dedicated
workflow lives on `/admin/shows/import`, where an operator can validate a
workbook inline and apply the import in one safe all-or-nothing write step.

## Current behavior

- The importer expects a single `.xlsx` workbook.
- The first sheet is read as the source workbook grid.
- The workbook header row is the source of import scope.
- The importer resolves headers through DB-backed workbook metadata before any
  row parsing:
  - `ShowWorkbookColumnRule` defines each supported workbook header, its
    import policy, requiredness, parser mode, and canonical destination in the
    show model
  - `ShowResultDefinition` remains the source of truth for canonical result
    codes and their supported value types
  - `ShowResultCategory` scopes `DEFINITION_FROM_CELL` rules so workbook values
    such as `Luokka` and `Laatuarvostelu` resolve only inside their configured
    definition category
- Header matching tolerates whitespace and punctuation differences.
- Every non-empty workbook column must resolve to one of:
  - imported to a persisted canonical destination
  - ignored explicitly by seeded import policy
- Missing required structural fields remain blocking errors.
- Unknown extra workbook columns are blocking validation errors.
- Duplicate non-empty workbook headers are blocking validation errors.
- Blank header columns are ignored only if the full column is empty. A blank
  header column with row data is a blocking validation error.
- Result columns are validated against the canonical `ShowResultDefinition`
  catalog. Disabled or unsupported definition-backed columns are blocking
  errors.
- `Luokka` and `Laatuarvostelu` are required workbook columns, but their values
  are validated directly against enabled `ShowResultDefinition.code` rows. The
  validator no longer uses a hardcoded accepted-value map or speculative alias
  normalization such as `JU -> JUN`.
- Preview resolves local dogs by registration number and reports missing dogs as
  warnings, not blocking errors.
- Preview runs duplicate checks against canonical persisted keys:
  - blocks existing `ShowEntry.entryLookupKey`
  - blocks `ShowEvent.eventLookupKey` metadata conflicts (`eventCity` or
    `eventType`)
  - warns (non-blocking) once per imported event when any existing event is
    already on the same `eventDate` and asks the operator to review potential
    duplicates
  - allows existing event + compatible metadata + new entries
- The admin UI uses a server action to call the preview parser.
- Validation renders inline summary counts, schema resolution details, and
  issue-level notes.
- Preview renders parsed candidate events, entries, and result items on the
  same page.
- Apply re-runs parsing and duplicate checks before writing.
- Apply writes only in one `prisma.$transaction` and uses create-only semantics
  (`ShowEvent` create-if-missing, `ShowEntry` create-only, `ShowResultItem`
  create-only).
- The active workbook schema is global and edited in place. The validator and
  future admin settings use the same metadata contract.

## Implementation layout

The server import engine is organized as a stage-based pipeline under
`packages/server/admin/shows/import/internal/**` so preview and apply can share
the same evaluation flow without putting all logic into `preview-*` helper
files.

- `runtime/*`
  - orchestrates parse -> schema -> row -> duplicate -> summary stages
- `input/*`
  - parses the workbook and loads DB-backed lookup metadata
- `schema/*`
  - resolves workbook headers and turns schema mismatches into issues
- `rows/*`
  - evaluates one workbook row into structural values and row issues
- `result-items/*`
  - parses definition-backed result columns after structural row evaluation
- `duplicates/*`
  - applies persisted event and entry conflict checks
- `preview/*`
  - shapes parsed rows into preview event groups for the UI

Compatibility re-export files may still exist temporarily while tests and call
sites move to the clearer stage-based modules.

## Parser modes

`ShowWorkbookColumnRule.parseMode` is a constrained parser vocabulary. Admin
settings can edit which existing mode a workbook column uses, but adding a new
parser mode still requires code changes.

- `TEXT`
- - imports normalized text such as `Rekisterinumero`, `Paikkakunta`, or `Paikka` directly into the linked structural field without any definition lookup
- `DATE`
- - converts a valid workbook date (for example the `Aika` column) into the structural `eventDate` destination
- `DEFINITION_FROM_CELL`
  - normalizes the raw workbook value (e.g., `Luokka`/`Laatuarvostelu`) and matches it only against enabled `ShowResultDefinition.code`
  - matching is scoped to the rule's `allowedDefinitionCategoryCode`
  - reports an error when the value does not resolve to an enabled definition; no alias maps are applied
- `FIXED_FLAG`
  - writes a fixed definition (such as a `NAP` or `VARA` flag) whenever the cell contains either the normalized header name or an allowed truthy token like `KYLLÄ`
  - the parser treats the cell as truthy, not as a mapped code value
- `FIXED_NUMERIC`
  - writes a fixed numeric definition and stores the workbook integer (e.g., a certificate count) in `valueNumeric`
- `FIXED_CODE`
  - writes a fixed definition and parses the workbook value (currently Kennelliitto `PuPn` tokens, such as `PU1`/`PN4`) into `valueCode`
- `VALUE_MAP`
  - resolves the workbook cell through `ShowWorkbookColumnValueMap` entries so legacy rating strings can point to canonical definitions
  - workbook values must match one of the configured mapped values after the same normalization used elsewhere in the parser

## Admin settings boundary

The backend is prepared for future admin-managed workbook schema editing, but
that future UI will still operate inside the current parser contract:

- admins can edit headers, requiredness, import/ignore policy, parser mode,
  fixed definition references, category scope, and value maps
- lookup-key fields used to build canonical show identity remain protected:
  `Rekisterinumero`, `Aika`, `Paikkakunta`, `Paikka`, and `Näyttelytyyppi`
  must stay present and required
- admins cannot define arbitrary parser scripts or new parse-mode behavior
- save-time validation returns structured field-level errors for invalid rule
  edits
- duplicate header protection still uses the parser's normalized workbook
  header comparison rules, not only exact DB text

## Preview output

The preview response returns:

- total row count
- accepted row count
- rejected row count
- unique event count
- unique entry count
- result item count
- resolved schema details:
  - matched structural columns
  - matched result-definition columns
  - ignored workbook columns
  - blocked workbook columns
  - missing required structural fields
  - coverage counts for imported vs ignored vs blocked workbook columns
- structured issues with row, column, severity, and message data
- parsed preview events with nested entries and result items

## Safety rules

- Unsupported result values are blocking errors.
- Missing required structural columns are reported before any row-level parsing
  continues.
- Workbook columns that do not map to a supported persisted structural or
  result destination and do not have explicit ignore metadata block validation.
- `Rotukoodi` is currently seeded as an explicit ignore-by-policy column in
  `ShowWorkbookColumnRule`, so it stays visible in validation coverage but does
  not block preview or produce result items.
- Writes happen only after apply passes full revalidation.
- Any transaction failure or unique conflict rolls back the whole import.
- Preview is available only after validation succeeds without blocking errors.
  If the workbook still contains warnings or explicitly ignored columns, the
  operator must acknowledge those notes before preview opens.

## Next phase

Future admin settings should update `ShowWorkbookColumnRule` and
`ShowWorkbookColumnValueMap` rather than adding new code-owned header maps.
