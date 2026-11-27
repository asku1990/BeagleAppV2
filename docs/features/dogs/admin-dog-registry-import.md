# Admin Dog Registry Import

Admins can import Finnish Kennel Club Beagle registrations at
`/admin/dogs/import`. Open **Tuo rekisteritiedot** from the admin dog list.

## Workbook format

- Upload one `.xlsx` file, up to 10 MiB. The importer reads the first worksheet
  and reports any additional sheets as ignored. The first row contains headers.
- Before reading worksheet data, the importer checks ZIP expansion: up to
  20 MiB per entry, 50 MiB total, 100:1 expansion per entry, and 2,048 entries.
- Required headers: `Rekisterinumero`, `Nimi`, `Rotukoodi`, `Sukupuoli`,
  `Syntymäaika`, `Alkuperä`, `Rekisterinumero isä`, `Rekisterinumero emä`.
- Optional headers: `Kennel`, `Rekisteröity`, `Alkuperämaa`, `Väri`, `Häntä`.
- Use breed code `161` and sex values `uros` or `narttu`. Dates can be Excel
  date cells or text in `YYYY-MM-DD` format. Both parent registration numbers
  must be valid and at most 40 characters, even if the parents are not yet in
  Beagle App. Placeholders such as `-` or `U000` are not valid.

## Review and apply

1. Upload the workbook and review the preview. It does not write to the
   database. The review classifies the rows as new, updated, unchanged, or
   blocked and shows how many reference-only parents are planned.
2. Review the list directly: new dogs show their full imported details, and
   updates show which fields will be filled or replaced, including
   parent and breeder links. The update count is dogs, not fields. Filling a
   field and replacing an accepted value are both ordinary updates. Warnings
   explain what is skipped: an unresolved color, an unsupported column, or an
   extra worksheet. Workbook-wide issues appear above the rows. If there is a
   blocker, correct the workbook or the affected record, then preview again.
   A blocker prevents the entire import from being applied. The **Estävät**
   filter lists the missing kennel names for the whole workbook above the
   blocked rows.
   Each summary count opens its list. Warnings and blockers count individual
   issues (including workbook-wide ones); pedigree-only parents are listed
   separately by registration and role and do not count as source rows.
   Only unblocked source rows contribute to the planned parent count.
3. Select **Jatka vahvistukseen** and confirm to apply the reviewed changes.
   Apply rechecks the reviewed plan inside the audited transaction before
   writing, including on retries. If the preview is stale, review it again.
4. Preview the same workbook again to verify the result. If no changes remain,
   review shows **Ei tuotavia muutoksia** and disables confirmation. A direct
   Apply request for a current, empty plan also returns without writing.

## What gets written

- Dogs are matched by registration number. A new registration creates a
  normal dog. An existing dog keeps its identity; conflicting identity data,
  such as a different birth date or parent, can block the import.
- Nonblank workbook values can update the registration date, origin, origin
  country, and tail text. `Väri` updates the canonical color only if it
  matches exactly one Finnish color label, ignoring case and surrounding
  whitespace. Blank cells do not clear stored values.
- A nonblank `Kennel` must match exactly one existing breeder name, ignoring
  case and surrounding whitespace. The importer links a new or unlinked dog
  to that breeder and preserves the dog's free-text breeder information. It
  leaves an identical link unchanged. A missing or ambiguous match, or a dog
  linked to a different breeder, blocks Apply. Check the spelling and resolve
  the catalog or link separately, then preview again. The importer never
  creates breeders. A blank `Kennel` leaves breeder information alone.
- A valid parent already in the database is reused, including when the workbook
  uses another registration number for the same dog. A dog cannot be its own
  parent, and the same dog cannot be both sire and dam, even under different
  registration numbers. A valid missing parent is created as a reference-only
  dog if it has no full row in the workbook. A later valid full row can promote
  that same dog to normal.
- On creation or promotion, unlinked show and trial entries with a matching
  registration number can be linked to the dog.

## Azure production rollout check

After deployment, use only Preview to verify that a valid 10 MiB workbook
plus multipart overhead reaches the app. Separately verify that Azure ingress
rejects a request above its configured body cap before the route runs. The
application's own request cap is 10 MiB plus 32 KiB.
