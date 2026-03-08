# Documentation Rules

This document defines the default documentation flow for this repository.

## Goal

Keep documentation practical, local to the change, and easy for future contributors to find.

## Default decision flow

When you change something, pick the closest durable documentation surface that matches the change:

1. User-visible change: update `CHANGELOG.md`.
2. If the change also introduces contributor-facing rules or non-obvious behavior, also update the nearest feature or module `README.md`, or add a focused doc under `docs/`.
3. Non-obvious local code decision: add a concise code comment at the decision point.
4. Follow-up work not done now: add a note to `docs/tech-debt.md`.

## Core rules

- If you change how something works, update the nearest durable documentation source.
- `CHANGELOG.md` is for users. It does not replace developer-facing documentation.
- If contributors need implementation rules, naming conventions, visibility rules, or operational context, add a nearby `README.md` or a focused doc under `docs/`.
- When you add or update a feature or module `README.md`, document at least the purpose, main files or components, data flow or state flow, core render/behavior rules, and when the doc should be updated.
- Prefer short, specific docs over broad narrative docs.
- Prefer durable docs over long inline comments.

## When no extra docs are needed

- Small local fixes with obvious behavior usually do not need extra docs beyond code and tests.

## Code comments

Use code comments sparingly. Good reasons include:

- non-obvious mapping or normalization
- intentional field exclusion
- temporary constraint or compatibility behavior
- business rule that is not obvious from the code alone

For non-obvious function, mapper, formatter, and use-case files, add a brief 1-2 line responsibility comment when the file name alone is not enough context.
