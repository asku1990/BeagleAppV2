# Follow-up R3 — Rule-window-aware Result Fields

## Status and sequencing

This is the second result-creation follow-up after the current R2 implementation
and validation work. It is planning only and does not authorize implementation.

R2 must be completed and reviewed before this work begins. The initial R3
change introduces the rule-window structure and verifies only the current
2023+ field set. Exact historical field-set audits remain separate follow-up
work.

## Purpose

Make manual trial result creation and editing choose their visible score, era,
and lisätieto fields from the event's persisted `trialRuleWindowId`. This keeps
the current form aligned with the corresponding dog-trial PDF without coupling
form behavior to PDF coordinates.

The current mismatch is structural:

- PDF rendering already selects a renderer by rule window, while the admin form
  uses one global field list.
- The 2023+ renderer does not print the current form's `tja` and `pin` score
  fields.
- The current PDF consumes only part `a` for lisätieto codes `25` and `27`,
  while the form exposes parts `a`, `b`, and `c`.
- Lisätieto input types differ for codes `19`, `23`, `26`, and `59`.
- Historical templates contain different score and lisätieto sets.

## Scope

- Add `trialRuleWindowId` to the admin event-detail contract and propagate the
  stored value through the DB and service mappings.
- Add a semantic admin result field-set registry covering every seeded rule
  window ID.
- Keep PDF coordinates and drawing logic inside the PDF rule-set modules. The
  shared semantic configuration defines field availability and value kinds,
  not layout.
- Configure `trw_post_20230801` as the first verified field set:
  - drive visible entry score fields, era fields, and lisätieto rows from the
    configuration;
  - omit current-window score fields not consumed by the 2023+ PDF;
  - represent codes `25` and `27` with the PDF-consumed `a` part without showing
    the implementation suffix to the administrator;
  - correct lisätieto value kinds to match the current renderer; and
  - retain shared registration, owner, judge, result-status, trial-type, and
    other metadata required by persistence or PDF generation.
- Register other known, null, and unknown rule windows through one explicitly
  unverified fallback matching the current form behavior. Show a localized
  warning instead of presenting the fallback as template-verified.
- Apply the selected field set to both the full-page create form and the
  existing edit modal.
- Preserve hidden values when editing an existing result. Selecting a narrower
  field set must not silently clear compatibility data or source-projected
  lisätieto rows.
- Keep backend write shapes and their existing validation semantics unchanged.
  This gate controls admin presentation and does not add rule-window-specific
  server rejection.
- Update the durable admin-trial documentation and add a user-visible
  `CHANGELOG.md` entry when the behavior is implemented.

## Exclusions

- No Prisma schema or migration changes.
- No new production dependency.
- No PDF coordinate or template changes.
- No claim that 2005–2011 or 2011–2023 admin field sets are exact.
- No removal or migration of stored compatibility fields.
- No rule-window-specific validation in Koiratietokanta ingestion.
- No redesign of result creation or the existing edit modal.

## Acceptance criteria

- Admin event details return the event's persisted `trialRuleWindowId`.
- Create and edit resolve their field set from that stored ID rather than from
  the browser date.
- A 2023+ event displays the verified score, era, and lisätieto configuration.
- Codes `25` and `27` persist with part `a`, appear as single rows, and reach
  the existing PDF pivot correctly.
- Current-window lisätieto value kinds match the 2023+ renderer.
- Other known, null, and unknown windows retain the existing generic editing
  capability and display an unverified-field-set warning.
- Editing through a narrower field set preserves hidden existing values.
- Existing create/update request contracts and server validation behavior do
  not change.

## Targeted validation

- Contract, DB-mapping, and service tests for `trialRuleWindowId` in admin event
  details.
- Field-registry tests covering every seeded rule-window ID and fallback
  behavior.
- 2023+ parity tests for visible score fields, era fields, lisätieto codes,
  parts, ordering, and input kinds.
- Create-form and edit-modal tests for rule selection, the fallback warning,
  and hidden-value preservation.
- Regression tests for request serialization, current validation feedback, and
  PDF part-`a` mapping.
- Targeted web, contracts, server, and DB type checks and tests, plus targeted
  lint without cycle lint.

## Later historical audit

After R3 is reviewed, separately compare the 2005–2011 and 2011–2023 PDF
templates and renderers with stored legacy/API data. Replace the unverified
fallback for each window only after its score fields, supported era behavior,
lisätieto rows, value kinds, and preservation behavior have dedicated tests.
