# AJOK PDF rule periods

This document tracks AJOK PDF availability by rule period. It intentionally
does not define field mapping for any single pöytäkirja renderer.

## Rule-period availability

- `trw_pre_20020801`: not implemented.
- `trw_range_2002_2005`: not implemented.
- `trw_range_2005_2011`: blank template exists for future work, renderer not
  implemented.
- `trw_post_20110801`: implemented through the `legacy-2011-2023` renderer.
  Field mapping and renderer details are documented in
  `docs/features/trials/ajokoe-koirakohtainen-poytakirja-2011-2023.md`.
- `trw_post_20230801`: not implemented.
- Unknown or null rule periods are unsupported.

## Runtime behavior

- The API route serves PDF bytes only for implemented rule sets.
- Blank-only, unimplemented, unknown, or null rule sets return
  `TRIAL_PDF_NOT_AVAILABLE`.
- The renderer must not draw fields from one rule period onto another rule
  period's template.

## Template assets

- Official current template:
  `/Users/akikuivas/personal-projects/beagle/beagle-app-v2/apps/web/public/templates/ajok-koirakohtainen-poytakirja.pdf`
- Future 2005-2011 placeholder template:
  `/Users/akikuivas/personal-projects/beagle/beagle-app-v2/apps/web/public/templates/ajok-koirakohtainen-poytakirja-2005-2011.pdf`

Do not modify the official current template when adding or changing legacy rule
period support.
