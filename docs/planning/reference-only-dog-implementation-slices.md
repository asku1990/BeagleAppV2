# Reference-Only Dog Implementation Slices

## Summary

Implement reference-only dog identities in small reviewable slices. This plan
describes implementation order and safety requirements for schema, visibility,
admin writes, admin promotion, the one-time legacy phase1 migration, and durable
documentation.

Schema and read protections should land before any write flow starts creating
`REFERENCE_ONLY` identities. The slices may land as separate PRs or separate
commits.

Do not add a separate broad pre-refactor. If helper extraction is needed, keep it
inside the slice that uses it, such as a shared status filter after the schema
slice or a small phase1 relation-classification helper inside the phase1 slice.

## Cross-Cutting Requirements

- `DogRegistration.registrationNo` remains globally unique, every registration
  belongs to exactly one dog, and create, link, and promotion flows reuse the dog
  that already owns the registration.
- Promotion updates an existing dog instead of inserting a duplicate dog or
  registration.
- The synthetic `Dog.name` used for `REFERENCE_ONLY` rows is storage-only. API
  mappers, UI components, public output, exports, and other presentation layers
  must not present it as a known dog name.
- Admin tooling must clearly mark `REFERENCE_ONLY` records as reference-only.
- Pedigree and inbreeding code may use a linked `REFERENCE_ONLY` identity node,
  but must not imply that a real name is known.
- Parent resolution, reference creation, linking, and promotion should be
  transactional when they are part of the same operation.
- Admin parent resolution that creates a missing `REFERENCE_ONLY` parent should
  happen inside the same write transaction that links the child.
- Database registration uniqueness remains the final consistency guard.
- Concurrent admin attempts to create the same missing parent must result in one
  dog owning that registration. A losing operation should re-read and reuse the
  existing owner instead of returning an unhandled uniqueness error.
- Confirmed promotion must revalidate the current owner and status before
  updating.

## Slices

### 1. Schema and foundations

- Add Prisma enum `DogStatus` with `NORMAL` and `REFERENCE_ONLY`.
- Add `Dog.status` with default `NORMAL` and an index.
- There are no existing dog rows to migrate for this project state; the default
  applies to new rows created after the schema change.
- Keep `Dog.name` required.
- Use the registration number as the synthetic internal name for
  `REFERENCE_ONLY` rows. This exists only to satisfy the current required schema.
- Ordinary admin-created dogs and real legacy dog rows are `NORMAL`.
- `DogRegistration.source` is not part of this design.
- `NORMAL -> REFERENCE_ONLY` is not automatic or supported as a normal workflow.

### 2. Read visibility

- Exclude `REFERENCE_ONLY` dogs from public search.
- Exclude `REFERENCE_ONLY` dogs from direct public profile loads.
- Exclude `REFERENCE_ONLY` dogs from public virtual-pairing search and direct
  registration lookup.
- Exclude `REFERENCE_ONLY` dogs from default admin dog lists.
- Add an explicit admin list filter for `REFERENCE_ONLY` dogs.
- Allow admin detail tooling to display a `REFERENCE_ONLY` record when it was
  explicitly requested. Show the registration number separately, clearly label
  the record as reference-only, and do not present the synthetic `Dog.name` as a
  real dog name.
- Keep pedigree and inbreeding ancestry loaders status-neutral so linked
  `REFERENCE_ONLY` ancestors remain known identity nodes.
- Ensure public and admin presentation code does not expose the synthetic name as
  a real dog name.

### 3. Admin parent resolution

- Resolve sire and dam registrations against all existing dog registrations.
- If the registration already belongs to a `NORMAL` or `REFERENCE_ONLY` dog,
  link to that dog.
- If the registration is valid and not found, create one hidden `REFERENCE_ONLY`
  parent and link to it.
- Infer `MALE` for sire references and `FEMALE` for dam references.
- Invalid, placeholder-like, and ambiguous registrations must not create rows.
- Updating a dog may retain its own existing registration.
- Updating a dog to a registration owned by another dog must remain blocked.

### 4. Admin promotion

- If a create request uses a primary registration owned by a `REFERENCE_ONLY`
  dog, return a typed confirmation-required result.
- The confirmation result must identify the existing dog being promoted.
- A confirmed submit must revalidate that the same dog still owns the
  registration and is still `REFERENCE_ONLY`.
- Confirmed promotion updates that existing dog and changes its status to
  `NORMAL`.
- Promotion preserves dog ID, parent links, child links, registrations, and
  registration aliases.
- If the primary registration belongs to a `NORMAL` dog, block the create and
  guide the admin to the existing record.
- Updating one dog to a registration owned by another `REFERENCE_ONLY` dog must
  stay blocked until a separate explicit merge flow exists.
- Do not treat a normal dog update as an implicit merge or promotion flow.

### 5. Legacy phase1 import refactor

- Refactor the existing one-time legacy phase1 dog-import and
  relation-resolution rules to use registration ownership as the identity
  invariant.
- Phase1 runs against an empty database. During real dog import, create
  `NORMAL` dog rows according to the current phase1 import rules.
- During phase1 relation resolution, resolve sire and dam registrations against
  all dog registrations.
- Reuse already imported `NORMAL` parent identities.
- Create one `REFERENCE_ONLY` parent for each valid parent registration not
  already owned by a dog, and link all children that reference the same
  registration to the same parent.
- Infer `MALE` for sire-only references and `FEMALE` for dam-only references.
- A registration appearing as both sire and dam remains ambiguous, stays as an
  import diagnostic, and does not create a `REFERENCE_ONLY` row.
- Keep invalid, placeholder, ambiguous, and otherwise unresolved parent
  references as import diagnostics.
- Preserve existing phase1 behavior unless it directly conflicts with the
  reference-only identity rules.
- Do not introduce a new general-purpose import abstraction, future-source
  framework, synchronization system, or ongoing workflow.

### 6. Durable documentation

- After admin behavior lands, update `docs/features/admin-dog-management.md`.
- After phase1 behavior lands, update `docs/legacy-import/phase1.md`.

This implementation plan remains temporary planning documentation. Durable
behavior belongs in feature and migration documentation after implementation is
complete.

## Test Plan

### Schema and defaults

- No existing-dog data migration is required.
- Ordinary admin-created dogs default to `NORMAL`.
- New real legacy dogs created by phase1 are `NORMAL`.
- `Dog.status` is indexed.
- Registration uniqueness remains enforced.
- `REFERENCE_ONLY` dogs use the registration number as the internal synthetic
  name.

### Read visibility

- Default admin lists exclude `REFERENCE_ONLY`.
- Explicit admin filtering includes `REFERENCE_ONLY`.
- Public search excludes `REFERENCE_ONLY`.
- Direct public profile loading rejects or hides `REFERENCE_ONLY`.
- Public virtual-pairing search and direct registration lookup exclude
  `REFERENCE_ONLY`.
- Presentation layers do not expose the synthetic name as a real dog name.
- Admin detail view shows the registration number and a reference-only label
  without presenting the synthetic name as a real dog name.
- Pedigree and inbreeding include linked `REFERENCE_ONLY` ancestors.

### Admin parent resolution

- A missing valid sire registration creates and links one `REFERENCE_ONLY` dog
  with `MALE` sex.
- A missing valid dam registration creates and links one `REFERENCE_ONLY` dog
  with `FEMALE` sex.
- An existing `NORMAL` parent registration links to the existing dog.
- An existing `REFERENCE_ONLY` parent registration links to the existing dog.
- Multiple admin operations resolving the same missing parent result in one dog
  owning the registration.
- Invalid, placeholder-like, and ambiguous parent registrations create no rows.
- Updating a dog may keep its own registration.
- Updating a dog to a registration owned by another dog is blocked.

### Admin promotion

- Creating a normal dog with a primary registration owned by a `REFERENCE_ONLY`
  dog returns a typed confirmation-required result.
- The confirmation result identifies the exact existing dog.
- Confirmed promotion updates that same dog.
- Promotion changes status to `NORMAL`.
- Promotion preserves dog ID, parent links, child links, registrations, and
  aliases.
- A stale confirmation is rejected.
- A mismatched confirmation is rejected.
- A primary registration owned by a `NORMAL` dog is blocked.
- Updating one dog to a registration owned by another `REFERENCE_ONLY` dog is
  blocked.

### Legacy phase1 import refactor

- Real legacy dog rows create `NORMAL` dogs according to existing phase1 rules.
- A sire-only missing registration creates a `MALE` reference identity.
- A dam-only missing registration creates a `FEMALE` reference identity.
- A registration appearing as both sire and dam remains an ambiguity diagnostic
  and creates no dog row.
- Multiple children referencing the same missing parent registration link to the
  same dog.
- Already imported `NORMAL` parent identities are reused.
- Invalid, placeholder, ambiguous, and unresolved references remain diagnostics.
- Existing phase1 behavior not intentionally changed by this feature remains
  covered by regression tests.

## Assumptions

- `DogRegistration.source` is not part of this design.
- `NORMAL -> REFERENCE_ONLY` is not automatic or supported as a normal workflow.
- Phase1 is a one-time migration, not a reusable import or synchronization
  system.
