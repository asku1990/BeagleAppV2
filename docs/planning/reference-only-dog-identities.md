# Reference-Only Dog Identities

## Goal

Preserve dog identities that are needed as pedigree references without
presenting them as standalone public dogs. Status controls visibility and
identity use; it does not limit how much known information may be stored.

Implementation order and review gates are defined in
[reference-only-dog-implementation-slices.md](./reference-only-dog-implementation-slices.md).

## Identity model

- `NORMAL` is a standalone public dog identity.
- `REFERENCE_ONLY` is a non-public standalone identity retained for references,
  especially sire and dam relationships.
- A reference-only dog may contain every known dog detail. It is not restricted
  to registration and sex, and status must not be inferred from missing fields.
- Registration ownership remains globally unique across both statuses.
- Reference-only dogs participate in pedigree, disease ancestry, and inbreeding
  calculations.
- Editing status reuses the same dog identity and registration; it does not
  create or merge another dog.

## Public visibility and presentation

- Public dog roots, searches, profiles, dog-trials roots, and virtual-pairing
  roots include only normal dogs.
- Public dog-derived aggregates count normal dogs only.
- Linked reference-only parents and ancestors remain available to calculations
  and may be shown within a normal dog's pedigree context.
- Nested reference-only identities show their stored name and registration but
  do not link to a standalone public profile. Presentation does not infer an
  unknown name when the stored name equals the registration.

## Admin behavior

- The existing admin create/edit modal exposes `NORMAL` and `REFERENCE_ONLY`
  status.
- Every existing form field remains available for both statuses, and every
  supplied value is retained.
- Normal dogs keep the existing required-field and parent rules.
- Reference-only dogs require a valid primary registration but may have unknown
  details or missing parents.
- Because `Dog.name` remains database-required, an unknown reference-only name
  uses the normalized primary registration as an internal fallback until a
  known name is entered.
- Admin parent lookup includes both statuses. A selected reference-only dog can
  be linked as sire or dam like any existing dog.
- Creating or editing a child never creates a missing parent implicitly. Admin
  creates the reference-only parent separately and then selects it.
- Changing a reference-only dog to normal requires the normal-dog validation
  rules and preserves the existing identity and information.

## Phase-one import behavior

- The one-shot phase-one bootstrap may create missing reference-only sire and
  dam identities automatically before writing relations.
- A valid missing registration used only as a sire implies `MALE`; one used only
  as a dam implies `FEMALE`.
- Matching source details are retained when available. If no name is known, the
  normalized registration is used as the internal fallback.
- Existing registrations are reused regardless of dog status.
- Invalid registrations, placeholders, and registrations used ambiguously in
  both parent roles do not create reference-only identities and remain import
  diagnostics.

## Domain guardrails

- A valid registration passes normal registration validation and is not a
  placeholder or ambiguous value.
- Registration uniqueness is the final identity consistency guard.
- Status changes do not erase profile facts, ownerships, parents, titles, or
  other stored information.
- No workflow silently creates a parent identity during ordinary child-dog
  creation or editing.

## Deferred work

- `DogRegistration.source` changes.
- Admin list filters and status badges outside the create/edit form.
- New disease, show-result, trial-result, or other profile-fact write guards.
- Automatic creation of missing parents from the child form.
- Implicit dog merging or registration reassignment.
- Compatibility workflows for partially completed legacy bootstrap runs.
