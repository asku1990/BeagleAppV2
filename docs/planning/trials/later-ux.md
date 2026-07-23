# Deferred Trial Management UX

## Status

This document records deferred ideas only. It does not authorize design,
implementation, refactoring, schema work, or preparatory changes. BEJ-103 can
be completed without any item in this file.

To move an item into implementation, first update the relevant planning gate,
define its scope and acceptance criteria, and obtain explicit approval under
the review rules in the [BEJ-103 planning overview](./README.md).

## Deferred ideas

- Replace the current trials master-detail list with a navigation-only event
  index.
- Move editing of existing results from the modal to the reusable full-page
  result form.
- Make existing result editing rule-window-aware, including preservation of
  stored fields hidden by a narrower verified field set.
- Redesign result editing only after the R3A and R3B creation gates have been
  implemented, validated, and reviewed.
- If a guided or multi-step result flow is adopted later, implement it as a
  coordinator that controls visibility of the reusable R3B cards rather than
  rewriting their field presentation.
- Add searchable dog selection to manual result creation.
- Allow inline dog creation from the result flow.
- Add an explicit draft/publish state for trial events or results.
- Enter and submit several dog results as one batch.
- Autosave event or result forms.
- Add reconciliation UI for manual and Koiratietokanta data conflicts.

## Explicit exclusions from current gates

- E1 and E2 retain the existing trials master-detail list.
- R1 and R2 retain the existing result-edit modal.
- R2, R3A, and R3B use a free-text registration field and save one complete
  result at a time.
- R3A and R3B do not change result editing. Older, null, and unknown rule
  windows use the warned show-all fallback only in result creation.
- R3B keeps result creation on one page; a wizard or mandatory multi-step
  coordinator is not part of the current gates.
- Matching Koiratietokanta upserts are resolved by the authoritative backend
  behavior documented in [Result creation](./result-creation.md), without a
  manual reconciliation screen.
