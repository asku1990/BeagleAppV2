# Reference-Only Dog Implementation Slices

## Summary

Implement reference-only dog identities in small, reviewable versions. The
accepted `Dog.status` schema is the foundation. Canonical behavior is defined
in [reference-only-dog-identities.md](./reference-only-dog-identities.md).

After the schema foundation, the first versions are:

1. public visibility,
2. status-aware admin dog creation and editing, and
3. phase-one import creation and linking of missing parents.

Admin filters, list badges, profile-fact guards, and other admin polish are not
prerequisites for these versions.

## Review gates

- Implement only one version at a time in the required order.
- Run the version validation, report changed behavior and remaining risks, and
  stop for explicit approval.
- Passing tests does not authorize starting the next version.
- If review changes behavior, update these planning documents before coding
  continues.

## Foundation: schema and status

- `DogStatus` contains `NORMAL` and `REFERENCE_ONLY`.
- Indexed `Dog.status` defaults to `NORMAL`.
- `Dog.name` remains required at the database level.
- Registration ownership remains globally unique.

Acceptance:

- The migration and Prisma schema define the enum, default, and index.
- Existing callers that do not explicitly choose a status continue to create
  normal dogs.
- Registration uniqueness remains the final consistency guard.

## Version 1: public visibility

- Require `NORMAL` status for public dog search, newest dogs, direct profiles,
  and dog-trials identity roots.
- Require `NORMAL` status for public virtual-pairing search and calculation
  roots.
- Count only normal dogs in public dog-derived counts and youngest-dog metrics.
- Keep pedigree relations, ancestry loading, disease ancestry, and inbreeding
  calculations status-neutral.
- When a reference-only dog appears as a parent or ancestor of a normal dog,
  show its stored name and registration but do not link to a standalone public
  profile. Do not infer an unknown name when the stored name equals the
  registration.
- Keep admin reads, parent lookup, and admin virtual pairing status-neutral.

Acceptance:

- Reference-only identities cannot be discovered or opened as standalone
  public dogs.
- A normal dog's reference-only ancestors remain visible where relevant and
  continue participating in pedigree and inbreeding calculations.
- Registered-dog, youngest-dog, and performed-by-dog metrics exclude
  reference-only identities; entry totals and result date ranges are unchanged.
- Non-public reads are not narrowed by the public visibility policy.

Review gate: stop after targeted tests, typecheck, and lint. Continue only after
explicit approval.

## Version 2: status-aware admin create and edit

- Add a `NORMAL` / `REFERENCE_ONLY` status section to the existing admin dog
  create and edit modal. New dogs default to `NORMAL`.
- Keep every existing dog form section available for both statuses. A
  reference-only dog may store every known field, including name, birth date,
  breeder, owners, parents, metadata, titles, and notes.
- Carry status through the admin create, update, and dog-list contracts only as
  needed to write the value and populate edit mode. Do not add list filters or
  list badges in this version.
- Preserve the current required-field and parent rules for normal dogs.
- For reference-only dogs, require a valid primary registration, allow unknown
  fields and missing parents, and validate and persist every supplied value
  normally.
- If the name is unknown, use the normalized primary registration as the
  database-required internal fallback. Replace that fallback when a known name
  is later entered.
- Allow status to be changed in edit mode without deleting stored details.
  Changing to `NORMAL` must satisfy the normal-dog validation rules.
- Keep parent selection explicit: the parent lookup includes both statuses, and
  selecting an existing reference-only dog links that row as sire or dam.
- Do not create a missing parent automatically from the child form. The admin
  first creates the parent as a separate reference-only dog, then selects it in
  the existing parent fields.

Acceptance:

- Admin can create and edit reference-only dogs using the existing modal and
  may record every known detail.
- Admin can select and link an existing reference-only sire or dam when creating
  or editing another dog.
- Missing parents still fail resolution instead of being silently created.
- Changing a reference-only dog to normal reuses the same dog and registration;
  it does not create a duplicate identity.

Review gate: stop after targeted tests, typecheck, and lint. Continue only after
explicit approval.

## Version 3: phase-one missing-parent import

- During the phase-one relation stage, collect valid sire and dam registrations
  that do not already own a dog identity.
- Create one `REFERENCE_ONLY` dog per unique missing registration and add it to
  the relation index before child relations are written.
- Infer `MALE` when the registration appears unambiguously as a sire and
  `FEMALE` when it appears unambiguously as a dam.
- Preserve supported source details when a matching legacy dog row provides
  them. Otherwise use the registration as the required internal name fallback.
- Reuse existing normal and reference-only registrations.
- Do not create identities for invalid registrations, placeholders, or a
  registration used ambiguously as both sire and dam. Preserve diagnostics for
  those cases.
- Keep the existing one-shot bootstrap assumptions; replay and partially
  imported environment compatibility remain out of scope.

Acceptance:

- Valid missing parents are created once and connected to every applicable
  imported child.
- Existing identities are reused and registration uniqueness is preserved.
- Invalid, placeholder, and ambiguous references remain unlinked and produce
  import diagnostics.
- Ordinary imported dog rows remain normal unless explicitly created by the
  missing-parent reference flow.

## Validation

For each version:

- Run focused co-located tests for touched behavior.
- Run typecheck and lint for touched packages.
- Run the full `pnpm test`, `pnpm typecheck`, and `pnpm lint` before the version
  is considered complete.
- Run cycle lint only when import or barrel restructuring changes the import
  graph.
- Never report a check as passing unless it was run.

## Deferred work

- Admin dog-list status filters and status badges outside the create/edit form.
- New profile-fact or result-write guards based on dog status.
- Automatic creation of missing parents from the child dog form.
- Implicit dog merging or registration reassignment.
- New production dependencies or further schema changes.
