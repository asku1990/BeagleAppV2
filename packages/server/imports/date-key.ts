import { toBusinessDateOnly } from "../core/date-only";

export function toOwnershipDateKey(value: Date | null): string {
  // Internal dedupe key: MariaDB/MySQL unique indexes allow multiple NULL values.
  return value ? toBusinessDateOnly(value) : "__NULL__";
}

export function toEventSourceDatePart(value: Date): string {
  return toBusinessDateOnly(value);
}
