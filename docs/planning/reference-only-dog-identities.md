# Reference-Only Dog Identities

## Goal

Preserve known ancestor identities when only a registration number is available,
without presenting those records as normal dog profiles.

This applies to legacy import, admin-created dogs, future imports, and external
registration sources. The status names must describe data completeness, not the
source that created the row.

## Decisions

- Add a source-agnostic dog identity state:
  - `NORMAL`: complete enough to behave as a normal dog record.
  - `REFERENCE_ONLY`: hidden dog identity created from a known registration
    reference, with no trusted profile data yet.
- `REFERENCE_ONLY` dogs may have only:
  - registration number
  - known or inferred sex
  - source metadata on the registration row
  - optional internal note/audit context
- `DogRegistration.source` records where the registration came from. Dog status
  records how complete the dog identity is.
- `DogRegistration.registrationNo` remains the globally unique identity key. No
  flow may create a second registration row with the same registration number.
- Valid missing sire/dam registrations may create `REFERENCE_ONLY` dogs and link
  the child to them.
- A later trusted import with real dog data for the same registration must
  promote/update the existing `REFERENCE_ONLY` dog that owns that registration.
- Interactive admin create flows must confirm before promoting an existing
  `REFERENCE_ONLY` dog into a normal dog.
- `REFERENCE_ONLY` dogs count as known pedigree slots and participate in
  inbreeding as identity nodes.
- `REFERENCE_ONLY` dogs are hidden from public views and default admin lists,
  but admin tooling should provide an explicit filter for finding them.

## Guardrails

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

- When an admin enters a missing valid sire or dam registration, create a hidden
  `REFERENCE_ONLY` parent and link the dog to it.
- Infer sex from the parent role when creating the reference:
  - sire -> `MALE`
  - dam -> `FEMALE`
- If a matching `REFERENCE_ONLY` row already exists, reuse it.
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
- If an admin enters a missing valid parent registration, create one
  `REFERENCE_ONLY` parent for that registration and link to it.
- Updating a dog may keep its own existing registration.
- Updating a dog to a registration owned by another `NORMAL` dog must be blocked
  as an existing dog.
- Updating a dog to a registration owned by another `REFERENCE_ONLY` dog must
  not silently steal or merge the reference row. That requires a separate
  explicit merge/promote flow if needed later.
- If the entered registration is invalid, placeholder-like, or ambiguous, reject
  or flag it using normal validation instead of creating a row.

### Import relation resolution

- During relation linking, resolve parent registrations against all dog
  registrations.
- For valid missing parent registrations, create one `REFERENCE_ONLY` dog per
  unique registration and link all children to it.
- If imported real dog data matches an existing `REFERENCE_ONLY` registration,
  update/promote that existing dog row.
- If imported real dog data matches an existing `NORMAL` registration, update
  that existing dog row according to normal import rules.
- Existing import diagnostics for missing parent refs should shrink to only
  genuinely unresolved cases.
- Placeholder, invalid, and ambiguous references remain diagnostics and are not
  linked.

### Promotion to normal dog

- When real dog data arrives for a registration already attached to a
  `REFERENCE_ONLY` dog, update that same dog row.
- Promotion should change status to `NORMAL` only when trusted profile data is
  present.
- Promotion must preserve existing child links and any existing registration
  aliases.
- Promotion must not insert a duplicate registration. It updates the dog that
  already owns the registration number.
- Admin promotion requires an explicit confirmation prompt. Import promotion is
  non-interactive and may happen automatically for trusted source data.

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

- Prisma/schema: add a source-agnostic dog status or data-quality field.
- Admin dog create/update: allow missing parent registrations to create or reuse
  reference-only parents.
- Legacy phase1 import: create/link valid missing parent references during
  relation resolution.
- Public/admin queries: exclude reference-only rows by default and add explicit
  admin filtering.
- Promotion path: update existing reference-only rows when real dog data arrives.
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
- Admin update cannot silently change a dog to a registration owned by another
  `REFERENCE_ONLY` dog.
- Import creates one reference-only parent per valid missing parent registration
  and links all referenced children.
- A later trusted import with real dog data promotes an existing reference-only
  row without creating another registration row.
- Multiple children referencing the same missing parent registration all link to
  the same `REFERENCE_ONLY` dog.
- Invalid, placeholder, and ambiguous parent references do not create dog rows.
- Public search and virtual-pairing search do not return reference-only dogs.
- Admin can explicitly filter reference-only dogs.
- Pedigree completeness and inbreeding include linked reference-only ancestors.
