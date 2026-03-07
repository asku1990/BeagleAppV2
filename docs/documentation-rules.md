# Documentation Rules

This document defines how to document code and follow-up work in this repository.

## Goal

Keep documentation practical, local to the behavior being changed, and durable enough that future contributors do not need to rediscover intent from code alone.

## Core rules

- If you change how something works, update the nearest durable documentation source.
- Require documentation updates only for touched areas where behavior, architecture, contracts, operations, or non-obvious implementation intent changes.
- Prefer short, specific documentation over broad narrative docs.
- Prefer durable docs over long inline comments.

## Where documentation should go

Use the closest document that matches the kind of change:

| Change type                        | Preferred location                                         |
| ---------------------------------- | ---------------------------------------------------------- |
| User-visible behavior              | `CHANGELOG.md` and the nearest usage doc                   |
| Architecture or boundaries         | `ARCHITECTURE.md` or a focused doc in `docs/`              |
| Feature/domain behavior            | feature or module `README.md`, or a focused doc in `docs/` |
| Contract or integration semantics  | the relevant contract or API doc in `docs/`                |
| Operational workflow               | runbook-style docs in `docs/`                              |
| Non-obvious local code intent      | concise code comment at the mapping or decision site       |
| Future cleanup or fix not done now | `docs/tech-debt.md`                                        |

## When to document

| Situation                                          | Expected documentation update                                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| New feature with user-visible behavior             | Update `CHANGELOG.md` and the nearest feature or usage doc                                                    |
| Refactor that changes structure or boundaries      | Update architecture or feature-level documentation if the new shape affects maintainability or future changes |
| Contract or payload change                         | Update the relevant contract or API documentation                                                             |
| Migration, env, or deployment change               | Update the relevant operational doc                                                                           |
| Temporary workaround or intentional exclusion      | Add a concise code comment at the decision point and add a tech-debt note if follow-up is needed              |
| New non-obvious formatter / mapper / use-case file | Add a short file-level responsibility comment if the file name alone is not enough context                    |
| Small local fix with obvious behavior              | No extra docs needed beyond code and tests                                                                    |

## Code comments

Use code comments sparingly.

Good reasons to add a comment:

- non-obvious mapping or normalization
- intentional field exclusion
- temporary constraint or compatibility behavior
- business rule that is not obvious from the code alone

File-level responsibility comments are useful for non-obvious function, mapper, formatter, and use-case files. Keep them to 1-2 lines and describe the file's responsibility, not its syntax.

Avoid comments that only restate the code.

## Future cleanup and fix notes

If you notice cleanup or follow-up work that will not be done in the current change:

- add a short durable note to `docs/tech-debt.md`
- use inline `TODO` / `FIXME` only when the note must sit next to the touched code to remain understandable
- keep inline notes brief and ticket-linked when possible

## Default workflow

1. Make the code change.
2. Decide whether the touched area changed behavior, structure, contracts, operations, or non-obvious intent.
3. Update the nearest durable documentation source if yes.
4. Record deferred cleanup or follow-up work in `docs/tech-debt.md` if it will not be handled now.
