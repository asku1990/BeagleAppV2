# Dog Color Catalog Import

## Goal

Use one canonical multilingual dog-color catalog for legacy import, profile rendering, and admin dog registration while preserving unnamed historical source codes.

## Decisions

- `DogColorStatus` has `SELECTABLE`, `HIDDEN`, and `LEGACY_UNKNOWN` states.
- A typed TypeScript catalog is seeded before phase-1 dog writes; legacy `beacolor` is not a label source.
- Code `0` remains no color.
- Unnamed workbook codes are retained as hidden lookup rows and displayed with their numeric code.
- New assignments require `SELECTABLE`; an existing hidden value may be preserved or cleared.
- Public and admin profile contracts carry multilingual color data so locale changes do not require refetching.

## Validation

- Catalog contains 54 unique positive codes: 7 selectable, 21 hidden, and 26 legacy unknown.
- A fresh phase-1 import links every color code in the reviewed missing-code workbook.
- Finnish and Swedish profile/admin rendering is covered by tests.
