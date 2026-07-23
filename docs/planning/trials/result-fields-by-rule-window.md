# Follow-up R3A — Rule-Window-Aware Result Creation

## Status and sequencing

This is the first creation follow-up after R2. It is planning only and does
not authorize implementation.

R2 must be completed and reviewed before this work begins. R3A introduces the
rule-window field-set structure only for the existing full-page result-create
form and verifies the current 2023+ field set. R3B may redesign result
creation only after R3A has been implemented, validated, and reviewed.

Existing result editing remains unchanged. Rule-window-aware editing and edit
UX are deferred work recorded in [Later UX](./later-ux.md).

## Purpose

Make manual trial result creation choose its visible score, era, and
lisätieto fields from the event's persisted `trialRuleWindowId`. This aligns
new 2023+ results with the corresponding dog-trial PDF before changing the
creation UI.

The current mismatch is structural:

- PDF rendering already selects a renderer by rule window, while the admin
  create form uses one global field list.
- The 2023+ renderer does not print the create form's `tja` and `pin` score
  fields.
- The current PDF consumes only part `a` for lisätieto codes `25` and `27`,
  while the form exposes parts `a`, `b`, and `c`.
- Create-form lisätieto input kinds differ from the renderer for codes `19`,
  `23`, `26`, and `59`.
- Historical templates contain different score and lisätieto sets, but their
  exact create-form configurations have not been audited.

## Scope

- Add `trialRuleWindowId` to the admin event-detail contract and propagate the
  stored value through the DB and service mappings.
- Add a semantic result-create field-set registry covering every seeded rule
  window ID.
- Resolve the create field set from the event's persisted
  `trialRuleWindowId`, never from the browser or by recalculating from the
  event date.
- Keep PDF coordinates and drawing logic inside the PDF rule-set modules. The
  create registry defines field availability and value kinds, not layout.
- Configure `trw_post_20230801` as the first verified field set:
  - retain the existing registration, event/result metadata, owner, judge,
    status, note, total, and other persistence fields required by creation and
    PDF generation;
  - omit entry- and era-level `tja` and `pin` score fields;
  - expose lisätieto codes `10`–`27`, `30`–`42`, and `50`–`62`;
  - represent codes `25` and `27` with only their PDF-consumed `a` part,
    displayed as a single row without an implementation suffix;
  - use integer input for code `19`, decimal input for codes `23`, `26`, and
    `59`, and retain the renderer-compatible kinds for all other rows; and
  - keep the existing continuous-era behavior: start with one era and permit
    additional eras without a create-form maximum, even though the current
    PDF renders only eras 1 and 2.
- Register older known, null, and unknown rule windows through one explicitly
  unverified fallback matching the current show-all create-form behavior.
- Show a localized warning whenever the unverified fallback is active.
- Pass field-set configuration only into the result-create flow. Shared
  components must keep their current default behavior so the existing edit
  modal is unaffected.
- Keep backend write shapes and their existing validation semantics unchanged.
  R3A controls create-form presentation and does not add rule-window-specific
  server rejection.
- Update durable admin-trial documentation and add a user-visible
  `CHANGELOG.md` entry when implemented.

## Exclusions

- No result-create layout or navigation redesign.
- No changes to the existing result-edit modal, its visible fields, or its
  serialization behavior.
- No rule-window-aware result editing or hidden-value preservation work.
- No Prisma schema or migration changes.
- No new production dependency.
- No PDF coordinate, mapper, template, or rendering changes.
- No exact 2005–2011, 2011–2023, pre-2002, or 2002–2005 field-set claim.
- No removal or migration of stored compatibility fields.
- No rule-window-specific backend validation or Koiratietokanta ingestion
  changes.

## Acceptance criteria

- Admin event details return the event's persisted `trialRuleWindowId`.
- Result creation resolves its field set from that stored ID.
- A 2023+ create form displays the verified score, era, and lisätieto
  configuration.
- Codes `25` and `27` persist with part `a`, appear as single rows, and reach
  the existing PDF pivot correctly.
- Current-window lisätieto input kinds match the 2023+ renderer.
- Additional continuous eras remain available in the create form.
- Older known, null, and unknown windows retain the existing generic creation
  capability and display an unverified-field-set warning.
- Existing create request contracts and server validation behavior do not
  change.
- The existing edit modal renders and submits exactly as before.

## Targeted validation

- Contract, DB-mapping, and service tests for `trialRuleWindowId` in admin
  event details.
- Field-registry tests covering every seeded rule-window ID and null/unknown
  fallback behavior.
- 2023+ parity tests for visible entry fields, era fields, lisätieto codes,
  parts, ordering, and input kinds.
- Create-form tests for persisted-rule selection, fallback warning, unlimited
  continuous eras, and request serialization.
- Regression tests proving the edit modal retains its current complete field
  set and request serialization.
- PDF pivot regression tests for part `a` of codes `25` and `27`.
- Targeted web, contracts, server, and DB type checks and tests, plus targeted
  lint without cycle lint.

## Merge independence and review gate

R3A can merge independently after R2. It changes only the semantic
presentation of result creation and leaves result editing unchanged.

Stop after validation and request explicit review. Do not begin the guided
creation UX in R3B without separate approval.

## Later historical and edit work

After the creation gates are reviewed, plan result editing separately. That
work must define rule-window selection, hidden stored-value preservation, and
the edit interaction before changing the existing modal.

Historical create/edit field sets also require separate audits against the
2005–2011, 2011–2023, pre-2002, and 2002–2005 templates and source data.
