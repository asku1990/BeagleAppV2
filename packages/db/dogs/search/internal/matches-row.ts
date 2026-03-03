import type { RawDogRow } from "../../core/dog-row-loader";
import { matchesLike } from "./wildcard";
import type { SearchField } from "./types";

export function matchesRow(
  row: RawDogRow,
  patterns: Record<SearchField, string>,
): boolean {
  const activeFields = (["ek", "reg", "name"] as const).filter(
    (field) => patterns[field].length > 0,
  );

  return activeFields.every((field) => {
    const pattern = patterns[field];
    if (field === "ek") {
      const value = row.ekNo == null ? "" : String(row.ekNo);
      return matchesLike(value, pattern);
    }
    if (field === "reg") {
      return row.registrationNos.some((registrationNo) =>
        matchesLike(registrationNo, pattern),
      );
    }
    return matchesLike(row.name, pattern);
  });
}
