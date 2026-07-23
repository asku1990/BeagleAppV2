# Follow-up R3B — Guided Result-Creation UX

## Status and sequencing

This is the second creation follow-up after R2. It is planning only and does
not authorize implementation.

R3A must be implemented, validated, reviewed, and approved before R3B begins.
R3B consumes the R3A field-set registry and changes only the full-page
result-create experience. Existing result editing remains unchanged.

## Purpose

Replace the long result-create form with a guided, mobile-capable workflow
that keeps event context visible, presents only the selected rule window's
fields, and provides a clear review step before the one atomic save.

## Four-step creation flow

The create route keeps one in-memory draft across four steps:

1. **Perustiedot**
   - Show read-only event date, place, SKL ID, and rule-window information.
   - Enter registration, trial/dog metadata, owner snapshots, and
     judge/signature fields.
2. **Tulos ja pisteet**
   - Enter result, status, score, total, note, and era fields allowed by the
     R3A field set.
3. **Lisätiedot**
   - Select and enter the rule-window-specific per-era lisätiedot.
4. **Yhteenveto**
   - Review a structured, print-friendly representation of the unsaved
     request before submission.

No database write occurs when changing steps. The create mutation is called
only from the summary step.

Backward navigation is always allowed and retains the draft. Moving forward
validates the current step. Completed steps may be reopened directly; future
steps cannot be skipped.

## Lisätiedot interaction

- Group rows by the real PDF domains:
  - Olosuhteet
  - Haku
  - Haukku
  - Metsästysinto
  - Ajo
  - Muut ominaisuudet
- Support search by localized name or code, domain filtering, group
  expand/collapse, expand all, selected-row chips, and clearing selections.
- Show the lisätieto code before its localized name.
- Use localized value-kind or unit guidance. Do not invent descriptive
  business text that has no authoritative repository source.
- Selecting a row reveals one control per current era:
  - marker fields use checkbox-style controls;
  - integer and decimal fields use matching numeric input modes; and
  - the unverified fallback can continue to expose text inputs where its
    generic configuration requires them.
- Removing a selected row clears its unsaved era values and excludes it from
  the request.
- On desktop, keep the selected-row summary visible beside the groups when
  space permits. On mobile, render the same information above the stacked
  group cards.
- Show the current rule-window label and technical ID as read-only context.
  Show the R3A unverified warning for fallback field sets.

## Review, save, and errors

- The summary displays event identity, registration/basic data, result and
  era values, and selected non-empty lisätiedot.
- Do not add an unsaved official-PDF preview contract. The existing official
  PDF remains available only after a saved entry has an ID.
- Preserve the existing two successful submission paths:
  - **Save and add another** creates one result, then resets to step 1 with
    event-level judge defaults restored.
  - **Save and finish** creates one result and returns to the event workspace.
- Preserve duplicate-submit protection, Server Action mutation behavior,
  query invalidation/refetch, and the rule against optimistic partial cache
  insertion.
- Stable backend validation errors return to the populated relevant step:
  registration/basic errors to step 1, entry/era errors to step 2, and
  lisätieto errors to step 3.
- Event-not-found and missing-SKL errors retain their event-level states.
  Authentication and authorization retain the existing admin behavior.
- Preserve the existing dirty internal-navigation confirmation and native
  refresh/tab-close protection across every step. Browser Back retains the R2
  behavior.
- Add Finnish and Swedish labels, value hints, validation messages, success
  feedback, and error feedback for the redesigned creation flow.
- Add a user-visible `CHANGELOG.md` entry and update durable admin-trial
  documentation when implemented.

## Exclusions

- No result-edit UI or rule-window-aware editing.
- No migration of the edit modal to the guided flow.
- No unsaved PDF generation or new PDF preview endpoint.
- No searchable dog picker, inline dog creation, batch creation, autosave,
  draft/publish state, or reconciliation UI.
- No Prisma schema, backend write-contract, server-validation, PDF renderer,
  or Koiratietokanta ingestion changes.
- No new production dependency.
- No redesign of the trials index or event workspace.

## Acceptance criteria

- Creation uses the R3A field set for the event's persisted rule window.
- The four steps retain one draft and enforce forward validation without
  writing before the summary.
- Search, filtering, grouping, selection chips, and per-era inputs work with
  both the verified current field set and the warned fallback.
- The summary represents the final create request without offering an unsaved
  official PDF.
- Stable errors return to the correct populated step without losing values.
- Save-and-add-another and save-and-finish retain their existing persistence,
  reset, navigation, and cache behavior.
- Dirty navigation protection works throughout the flow.
- The workflow is usable at desktop and mobile widths in Finnish and Swedish.
- The existing result-edit modal behaves exactly as before.

## Targeted validation

- Form-model tests for step ownership, forward validation, backward
  navigation, completed-step navigation, reset, and draft retention.
- Lisätieto tests for search, filtering, grouping, selection/removal,
  per-era controls, corrected input kinds, and mobile/desktop summaries.
- Summary tests proving parity with the serialized create request.
- Mutation tests for stable error-to-step mapping, success continuations,
  duplicate-submit protection, invalidation/refetch, and no optimistic row.
- Navigation tests for dirty cancel, internal links, browser Back, and native
  refresh/close protection.
- Regression tests for event-level missing/error states, the event workspace,
  selected-event panel, and existing result-edit modal.
- Targeted web type checking, unit/component tests, and lint without cycle
  lint.
- Manual desktop and mobile browser checks for all four steps and both
  successful continuations when browser tooling is available.

## Merge independence and review gate

R3B can merge after R3A without any result-editing work. Stop after validation
and request creation-flow review. Editing remains a separately planned and
approved follow-up.
