# Reference-Only Dog Identities

## Goal

Preserve known ancestor identities when only a registration number is available,
without presenting those records as normal dog profiles.

This applies to admin dog creation/editing and the one-time legacy phase1 import.
The status names must describe data completeness, not the source that created the
row.

## Decisions

- Add a source-agnostic dog identity state:
  - `NORMAL`: normal dog record.
  - `REFERENCE_ONLY`: hidden identity known only from a valid registration
    reference.
- `REFERENCE_ONLY` dogs may contain only minimal domain data:
  - registration number
  - known or inferred sex
  - optional internal note/audit context
- `DogRegistration.registrationNo` remains globally unique, and all create,
  link, and promotion flows must reuse the dog that already owns that
  registration.
- Valid sire or dam registrations not already owned by an existing dog may create
  `REFERENCE_ONLY` dogs and link the child to them.
- `REFERENCE_ONLY -> NORMAL` is allowed only through explicit admin
  confirmation.
- `NORMAL -> REFERENCE_ONLY` is not an automatic or supported normal workflow.
- `REFERENCE_ONLY` dogs represent known ancestor identities and participate in
  pedigree and inbreeding calculations.
- `REFERENCE_ONLY` dogs are hidden from public views and default admin lists,
  but admin tooling should provide an explicit filter for finding them.

## Guardrails

- A valid registration is one that passes normal registration validation and is
  not a placeholder or ambiguous value.
- Do not create reference-only rows for invalid registration numbers.
- Do not create reference-only rows for placeholder registrations such as legacy
  unknown placeholders.
- Do not auto-create rows for ambiguous registrations that appear as both sire
  and dam without review.
- Keep unresolved, invalid, placeholder, and ambiguous parent references in
  import diagnostics.
- Do not treat `REFERENCE_ONLY` rows as having profile facts such as name, birth
  date, breeder, owner, color, titles, show results, or trial results.

## Expected Flows

### Admin dog creation and update

- If an admin creates a normal dog and the primary registration already belongs
  to a `REFERENCE_ONLY` dog, prompt before completing/promoting that existing
  dog row. If confirmed, update the existing dog that owns the registration.
- If an admin creates a normal dog and the primary registration already belongs
  to a `NORMAL` dog, block the save as an existing dog and guide the admin to the
  existing record.
- If an admin creates a normal dog and the primary registration is not found,
  create a new `NORMAL` dog.
- If an admin enters a parent registration already owned by any existing dog,
  link to the dog that owns that registration.
- Otherwise, if the parent registration is valid, create one hidden
  `REFERENCE_ONLY` parent and link to it.
- Infer sex from the parent role when creating the reference:
  - sire -> `MALE`
  - dam -> `FEMALE`
- Updating a dog may keep its own existing registration.
- Updating a dog to a registration owned by another `NORMAL` dog must be blocked
  as an existing dog.
- Updating a dog to a registration owned by another `REFERENCE_ONLY` dog must
  be blocked. Completing or merging that reference identity requires a separate
  explicit merge or promotion flow.
- If the entered registration is invalid, placeholder-like, or ambiguous, reject
  or flag it using normal validation instead of creating a row.

### Import relation resolution

- Legacy phase1 runs as a one-time migration against an empty database.
- During real dog import, phase1 creates `NORMAL` dog rows according to existing
  phase1 rules.
- During legacy phase1 relation linking, resolve parent registrations against all
  dog registrations.
- For valid parent registrations not already owned by an existing dog, create
  one `REFERENCE_ONLY` dog per unique registration and link all children to it.
- Existing import diagnostics for missing parent refs should shrink to only
  genuinely unresolved cases.
- Placeholder, invalid, and ambiguous references remain diagnostics and are not
  linked.

### Promotion to normal dog

- Admin promotion requires explicit confirmation.
- Promotion preserves the existing dog ID, parent/child links, registrations,
  and aliases.
- Promotion updates the existing dog rather than creating a duplicate dog or
  registration.

## Visibility And Calculations

- Public search, public profile routing, and public virtual-pairing search should
  exclude `REFERENCE_ONLY` dogs by default.
- Default admin dog lists should exclude `REFERENCE_ONLY` dogs unless an explicit
  filter requests them.
- Pedigree and inbreeding loaders should include linked `REFERENCE_ONLY` dogs
  because they represent known ancestor identities.
- UI labels should avoid implying that profile data is known. Admin views should
  clearly mark these records as reference-only.

## Implementation Areas

- Prisma/schema: add a source-agnostic dog status with `NORMAL` and
  `REFERENCE_ONLY`.
- Admin dog create/update: resolve parent registrations to existing dogs or
  create `REFERENCE_ONLY` parents when the registration is valid and not found.
- Legacy phase1 import: create/link valid missing parent references during
  relation resolution.
- Public/admin queries: exclude reference-only rows by default and add explicit
  admin filtering.
- Promotion path: support explicit admin promotion.
- Documentation: after implementation, promote durable behavior into
  `docs/features/admin-dog-management.md` and
  `docs/legacy-import/phase1.md`.

## Test Scenarios

- Admin creates a dog with missing sire and dam registrations; hidden
  reference-only parents are created and linked.
- Admin updates a dog with a missing parent registration; the reference-only
  parent is created or reused.
- Admin creates a dog whose primary registration exists as `REFERENCE_ONLY`;
  confirmation promotes that existing row and preserves pedigree links.
- Admin creates a dog whose primary registration exists as `NORMAL`; save is
  blocked before any duplicate insert.
- Admin enters a parent registration owned by an existing `NORMAL` dog; the
  child links to that existing dog and no new row is created.
- Admin update cannot silently change a dog to a registration owned by another
  `REFERENCE_ONLY` dog.
- Import creates one `REFERENCE_ONLY` parent per valid missing parent registration
  and links all referenced children.
- Admin enters a parent registration owned by an existing `REFERENCE_ONLY` dog;
  the child links to that existing dog and no new row is created.
- Multiple children referencing the same missing parent registration all link to
  the same `REFERENCE_ONLY` dog.
- Invalid, placeholder, and ambiguous parent references do not create dog rows.
- Public search and virtual-pairing search do not return reference-only dogs.
- Admin can explicitly filter reference-only dogs.
- Pedigree completeness and inbreeding include linked reference-only ancestors.
