# Follow-up R3B — Result-Creation UX

## Status and sequencing

This is the second creation follow-up after R2. It is planning only and does
not authorize implementation.

R3A must be implemented, validated, reviewed, and approved before R3B begins.
R3B consumes the R3A field-set registry and changes only the presentation of
the existing full-page result-create experience. Existing result editing
remains unchanged.

The referenced UX screenshots are concepts for hierarchy, cards, and
lisätieto interaction. They do not specify exact geometry, field counts,
placement, wording, or a mandatory navigation model.

## Purpose

Evolve the current single-page result-create form into a clearer,
mobile-capable set of reusable cards. Preserve the familiar save flow and
overall navigation while improving hierarchy, spacing, descriptions, and
grouping.

R3B owns presentation only. Field correctness, availability, ordering,
business grouping, semantic input kinds, and persistence mapping remain owned
by the R3A registry.

## Single-page card composition

Keep one full-page form and one in-memory draft. Do not require a wizard or
mandatory multi-step navigation.

A guided or multi-step presentation is permitted, but it is not an R3B
requirement. If implementation review shows that guidance is useful, add it as
a thin coordinator that controls which reusable cards are visible. It must not
duplicate card content, create separate field models, or change the existing
save and navigation contract.

Compose the page from independently reusable cards such as:

- event context;
- Perustiedot;
- Tulos ja huomautus;
- Ansiopisteet;
- Haku, Haukku ja muut;
- Tuomarit;
- Erät;
- Lisätiedot; and
- an optional informational Yhteenveto.

The exact card boundaries may combine closely related fields when needed for
responsive layout, but must preserve the current form organization and
backend request ownership. Other than Lisätiedot, R3B changes spacing,
descriptions, visual hierarchy, and grouping rather than introducing a new
workflow.

Cards must not own page navigation or rule-window resolution. They receive
draft values, callbacks, validation state, and resolved field configuration
through their interfaces. This keeps them reusable for future editing or for
an optional R3B coordinator that controls card visibility without rewriting
the cards.

## Rule-window presentation

- The event already owns the rule window; the administrator never selects it.
- Show only minimal localized read-only context, for example
  `Säännöt: 1.8.2023 →`.
- Do not expose `trialRuleWindowId` as a normal field. The technical ID may
  appear only in a tooltip, expandable debug information, or developer
  diagnostics.
- For an unverified fallback, show the R3A localized warning without asking
  the administrator to choose another rule window.
- Presentation components consume the R3A field set and contain no
  rule-window-specific branching.

## Lisätiedot workspace

Lisätiedot is the primary R3B UX improvement. Replace the extremely long
scrolling matrix with a dedicated workspace inside its own card.

The workspace supports:

- search by code;
- search by localized name;
- filtering by business/PDF domain;
- collapsible domain groups;
- expand all and collapse all;
- a selected-row summary above the groups;
- semantic per-era controls; and
- responsive desktop and mobile layouts.

Use the real business/PDF domains as the primary groups:

- Olosuhteet;
- Haku;
- Haukku;
- Metsästysinto;
- Ajo; and
- Muut ominaisuudet.

Numeric ranges may appear as secondary information but never define the
primary grouping.

Each row presents its code, localized name, optional authoritative
description, and semantic control together. Do not invent descriptions when
no authoritative source exists; use localized value-kind or unit guidance
instead.

Controls come from the R3A semantic input kind:

- `marker` renders as a checkbox or equivalent boolean control;
- `integer` renders as an integer input;
- `decimal` renders as a decimal input;
- `text` renders as a text input; and
- `tri-state` is allowed only when persistence explicitly distinguishes empty,
  `0`, and `1`, and renders as meaningful localized choices rather than raw
  persistence values.

Administrators must not normally enter raw persistence values such as `0` or
`1`. The UI translates semantic control state through registry persistence
mapping.

Selected rows remain visible in the summary above the groups. Removing a
selected row clears all of its unsaved era values. Rows with no values are
omitted from the create request, preserving the existing request behavior.

On desktop, the workspace may use adjacent filter, group, selected-row, and
editor regions when space permits. On mobile, it uses stacked groups or an
overlay/sheet while preserving the same selection and semantic controls.
These are responsive implementation choices, not separate workflows.

## Erät and other sections

- Keep each era visually independent in the existing card direction.
- Preserve adding and removing continuous eras and the R3A-configured visible
  fields.
- Retain the current organization and validation semantics for all other
  sections.
- Improve only spacing, localized descriptions, hierarchy, and grouping
  outside the Lisätiedot workspace.

## Optional summary

A lightweight informational summary card may appear near the bottom of the
same page. It may summarize:

- event context;
- dog/registration data;
- eras; and
- selected non-empty lisätiedot.

The summary is not a required confirmation step and does not add an official
PDF preview. The existing official PDF remains available only after a saved
entry has an ID.

## Save, errors, and navigation

- Preserve the existing two successful submission paths:
  - **Save and add another** creates one result, then resets the same page with
    event-level judge defaults restored.
  - **Save and finish** creates one result and returns to the event workspace.
- Preserve existing client/server validation, stable error mapping,
  duplicate-submit protection, Server Action mutation behavior, query
  invalidation/refetch, and the rule against optimistic partial cache
  insertion.
- Validation and server failures keep the populated single-page form visible
  and identify the relevant card or field without changing navigation.
- Preserve the existing dirty internal-navigation confirmation and native
  refresh/tab-close protection. Browser Back retains the R2 behavior.
- Add Finnish and Swedish labels, value hints, validation messages, success
  feedback, and error feedback for the evolved presentation.
- Add a user-visible `CHANGELOG.md` entry and update durable admin-trial
  documentation when implemented.

## Exclusions

- No requirement to implement a wizard or mandatory multi-step flow. Any
  guided presentation must remain a thin coordinator over the same reusable
  cards.
- No result-edit UI or rule-window-aware editing.
- No migration of the edit modal to the card-based create page.
- No unsaved PDF generation or new PDF preview endpoint.
- No searchable dog picker, inline dog creation, batch creation, autosave,
  draft/publish state, or reconciliation UI.
- No Prisma schema, backend write-contract, server-validation, PDF renderer,
  or Koiratietokanta ingestion changes.
- No new production dependency.
- No redesign of the trials index or event workspace.

## Acceptance criteria

- R3A remains the owner of business correctness and R3B changes presentation
  only.
- The existing result-create route remains a familiar single-page form with
  the same save and navigation behavior.
- A guided presentation, if adopted, reuses the same cards and field model and
  does not change persistence, save, or navigation behavior.
- Reusable cards render from the resolved R3A field set and contain no
  rule-window-specific branching.
- Rule windows remain mostly invisible: administrators cannot select one,
  normally see only a localized period label, and do not see the technical ID
  as a standard field.
- Lisätiedot provides search, domain filtering, collapsible groups,
  expand/collapse all, selected-row summary, and semantic per-era controls.
- Business/PDF domains are the primary lisätieto grouping; numeric ranges are
  secondary only.
- Removing a selected lisätieto clears its unsaved values, and empty rows are
  omitted from the create request.
- Erät and other sections preserve their current behavior while gaining
  clearer card hierarchy and responsive presentation.
- The optional summary is informational and does not create a new confirmation
  or PDF-preview step.
- Save-and-add-another, save-and-finish, validation, dirty navigation,
  mutation, and cache behavior remain unchanged.
- Cards are independently reusable by future editing without implementing or
  redesigning editing in R3B.
- The page is usable at desktop and mobile widths in Finnish and Swedish.
- The existing result-edit modal behaves exactly as before.

## Targeted validation

- Card tests for independent rendering, field-set-driven visibility,
  validation presentation, and draft callbacks.
- Lisätieto tests for code/name search, domain filtering, group
  expand/collapse, selected-row summary, selection removal, semantic controls,
  per-era values, and omission of empty rows.
- Tests proving semantic marker and tri-state controls serialize through the
  registry without exposing raw persistence values.
- Responsive component tests for desktop and mobile workspace variants.
- Regression tests for create request serialization, both success
  continuations, stable errors, duplicate-submit protection,
  invalidation/refetch, dirty navigation, and no optimistic row.
- Regression tests for event-level missing/error states, the event workspace,
  selected-event panel, and existing result-edit modal.
- Targeted web type checking, unit/component tests, and lint without cycle
  lint.
- Manual desktop and mobile browser checks for the card hierarchy,
  Lisätiedot workspace, and both successful continuations when browser tooling
  is available.

## Merge independence and review gate

R3B can merge after R3A without any result-editing work. Stop after validation
and request creation-flow review. Editing remains a separately planned and
approved follow-up.
