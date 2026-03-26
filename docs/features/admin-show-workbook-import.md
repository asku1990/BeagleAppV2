# Admin Show Workbook Import

This document describes the validation and preview steps for the new admin show
workbook import flow. `/admin/shows` acts as the module hub, and the dedicated
workflow lives on `/admin/shows/import`, where an operator can validate a
workbook inline and reveal a parsed preview section before any write phase
exists.

## Current behavior

- The importer expects a single `.xlsx` workbook.
- The first sheet is read as the source workbook grid.
- The workbook header row is the source of import scope.
- The importer resolves headers into a semantic schema before any row parsing:
  - required structural fields:
    - `Rekisterinumero`
    - `Aika`
    - `Paikkakunta`
    - `Paikka`
    - `Näyttelytyyppi`
    - `Nimi`
    - `Luokka`
    - `Laatuarvostelu`
  - optional structural fields:
    - `Tuomari`
    - `Arvostelu`
  - result columns:
    - known workbook result families such as `SERT`, `ROP`, `CACIB`, `JUN-ROP`,
      `SA`, `KP`, `Sijoitus`, `PuPn`
    - direct definition-backed columns whose header matches a seeded
      `ShowResultDefinition.code` or a code-owned alias
- Header matching tolerates whitespace and punctuation differences.
- Every non-empty workbook column must map to a real persisted import
  destination.
- Missing required structural fields remain blocking errors.
- Unknown extra workbook columns are blocking validation errors.
- Duplicate non-empty workbook headers are blocking validation errors.
- Blank header columns are ignored only if the full column is empty. A blank
  header column with row data is a blocking validation error.
- Result columns are validated against the canonical `ShowResultDefinition`
  catalog. Disabled or unsupported definition-backed columns are blocking
  errors.
- Structural class and quality values are validated against the exact workbook
  value set the importer supports. Speculative aliases such as `JU -> JUN` are
  not normalized silently.
- Preview resolves local dogs by registration number and reports missing dogs as
  warnings, not blocking errors.
- The admin UI uses a server action to call the preview parser.
- Validation renders inline summary counts, schema resolution details, and
  issue-level notes.
- Preview renders parsed candidate events, entries, and result items on the
  same page.

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
  - blocked workbook columns
  - missing required structural fields
  - coverage counts for imported vs blocked workbook columns
- structured issues with row, column, severity, and message data
- parsed preview events with nested entries and result items

## Safety rules

- Unsupported result values are blocking errors.
- Missing required structural columns are reported before any row-level parsing
  continues.
- Workbook columns that do not map to a supported persisted structural or
  result destination block validation.
- Columns like `Rotukoodi` stay blocked until the canonical write model has a
  real database destination for them.
- No canonical show tables are written in this phase.
- Preview is available only after validation succeeds without blocking errors.
- The import button exists only as a disabled placeholder; no apply/write logic
  exists yet.

## Next phase

The apply phase can reuse the same parser output, but it must stay separate from
this preview-only workflow.
