# BEJ-103 Gate F1 — Navigation-Only Event Index

## Status and sequencing

F1 is implemented with automated validation complete as the final BEJ-103
gate. E1, E2, R1, R2, R3A, and R3B were implemented and reviewed before this
close-out. F1 desktop and mobile browser verification was not run.

## Purpose

Complete the event-first admin workflow by making `/admin/trials` a
navigation-only event index. Event inspection and actions remain on the stable
`/admin/trials/[trialEventId]` workspace introduced in E1.

## Scope

- Open the exact event workspace when an administrator activates an event row
  or mobile card.
- Remove automatic first-event selection, the selected-event detail request,
  and the inline selected-event panel from the event index.
- Keep existing event filters, sorting, pagination, loading/error/empty states,
  and event creation access.
- Update localized guidance, durable admin-trial documentation, and the
  user-visible changelog.
- Mark the BEJ-103 planning sequence complete after validation.

## Exclusions

- No change to the dedicated event workspace or its event/result actions.
- No backend, API, contract, database, authorization, or public trial changes.
- No URL persistence for list filters, sorting, or pagination.
- No redesign of result creation or existing result editing.

## Acceptance criteria

- Activating any desktop event row or mobile event card opens that event's
  encoded workspace URL in the current tab.
- The index does not auto-select an event, request event details, or render an
  event detail panel below the list.
- List search and pagination behavior remains unchanged.
- Returning through browser history retains the current best-effort local-state
  behavior without introducing a query-parameter contract.
- The event workspace and all existing event/result actions behave as before.

## Targeted validation

- Component tests for direct navigation, encoded event IDs, link semantics,
  and absence of inline selection behavior.
- Regression tests for list states, pagination, the event workspace, and the
  selected-event panel.
- Targeted web type checking, unit tests, and lint without cycle lint.
- Manual desktop and mobile checks when browser tooling is available.

## Completion

F1 closes BEJ-103. Remaining ideas in `later-ux.md` continue to require
separate planning and approval.
