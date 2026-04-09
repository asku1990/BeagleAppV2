# Admin Dog Management

Developer notes for the admin dog management flow.

## Primary purpose

- The page is an admin-facing dog management workflow for search, create, edit, and delete.
- The main user task is to find a dog record and maintain dog identity details from one page.

## Main files

- `apps/web/app/(admin)/admin/dogs/page.tsx`: route entrypoint for the page.
- `apps/web/components/admin/dogs/admin-dogs-page-client.tsx`: page composition and query wiring.
- `apps/web/hooks/admin/dogs/manage/use-admin-dog-form-flow.ts`: modal/form state + mutation orchestration.
- `apps/web/components/admin/dogs/dog-form-modal.tsx`: thin form modal shell and section composition.
- `apps/web/components/admin/dogs/internal/*`: dog form private section components.
- `apps/web/lib/admin/dogs/manage/dog-form-mappers.ts`: pure query-to-view-model and lookup option shaping helpers.
- `apps/web/lib/admin/dogs/manage/dog-mutation-flow.ts`: pure mutation payload normalization and error-key mapping.
- `apps/web/lib/admin/dogs/manage/dog-form-section-updates.ts`: pure immutable field update helpers for section-level edits.
- `apps/web/components/admin/dogs/delete-dog-confirm-modal.tsx`: delete confirmation modal.
- `apps/web/components/admin/dogs/dog-results.tsx`: dog result table/cards with edit/delete actions.

## Data flow

1. `AdminDogsPageClient` loads dog results with `useAdminDogsQuery`.
2. The page delegates modal/form state and submit/delete handlers to `useAdminDogFormFlow`.
3. Lookup queries for breeder/owner/parent options are enabled while the form modal is open.
4. Lookup response data and current form values are shaped via pure feature-local `lib` helpers before rendering `DogFormModal`.
5. `DogFormModal` delegates large form areas to private `internal/*` sections while keeping controlled form values in the parent flow.
6. Create/update/delete actions call admin dog mutation hooks, then rely on existing query invalidation behavior from those hooks.

## Refactor boundary (BEJ-73)

- `AdminDogsPageClient` stays a composition shell.
- Non-UI form flow logic stays in feature-local hook/lib modules.
- `DogFormModal` remains presentational and receives prepared options/handlers as props.
- No contract/API payload shapes changed in this refactor.

## Tests

- Form modal rendering: `apps/web/components/admin/dogs/__tests__/dog-form-modal.test.ts`
- Page-client wiring and option shaping: `apps/web/components/admin/dogs/__tests__/admin-dogs-page-client.test.tsx`
- Form-flow hook behavior: `apps/web/hooks/admin/dogs/manage/__tests__/use-admin-dog-form-flow.test.ts`
- Pure helper behavior: `apps/web/lib/admin/dogs/manage/__tests__/dog-manage-lib.test.ts`

## When to update this doc

- Update this file when admin dog page composition responsibilities change.
- Update this file when admin dog form flow responsibilities move between component, hook, or lib layers.
- Update this file when mutation behavior or lookup option shaping semantics change.
