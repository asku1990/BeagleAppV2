# AJOK PDF rule periods

This document tracks AJOK PDF availability by rule period. It intentionally
does not define field mapping for any single pöytäkirja renderer.

## Rule-period availability

- `trw_pre_20020801`: not implemented.
- `trw_range_2002_2005`: not implemented.
- `trw_range_2005_2011`: implemented through the `legacy-2005-2011` renderer
  skeleton. The current renderer fills the core header, dog details, driving
  time, merit points, and loss-point sections while coordinates are tuned
  section by section.
- `trw_post_20110801`: implemented through the `legacy-2011-2023` renderer.
  Field mapping and renderer details are documented in
  `docs/features/trials/ajokoe-koirakohtainen-poytakirja-2011-2023.md`.
- `trw_post_20230801`: not implemented.
- Unknown or null rule periods are unsupported.

## Runtime behavior

- The API route serves PDF bytes for rule sets with a configured template.
- Rule sets without a configured template, unknown periods, or null rule
  periods return `TRIAL_PDF_NOT_AVAILABLE`.
- The renderer must not draw fields from one rule period onto another rule
  period's template.

## Template assets

- 2005-2011 template:
  `/Users/akikuivas/personal-projects/beagle/beagle-app-v2/apps/web/public/templates/ajok-poytakirja-2005-2011.pdf`
- 2011-2023 template:
  `/Users/akikuivas/personal-projects/beagle/beagle-app-v2/apps/web/public/templates/ajok-poytakirja-2011-2023.pdf`

Do not modify the official current template when adding or changing legacy rule
period support.
