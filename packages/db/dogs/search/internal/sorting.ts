import type { RawDogRow } from "../../core/dog-row-loader";
import { compareByRegistrationDesc } from "../../core/registration";
import type { BeagleSearchSortDb } from "../repository";

function compareRowsByRegistrationDesc(
  left: RawDogRow,
  right: RawDogRow,
): number {
  return compareByRegistrationDesc(
    left.primaryRegistrationNo,
    right.primaryRegistrationNo,
  );
}

function compareRowsByBirthDesc(left: RawDogRow, right: RawDogRow): number {
  if (left.birthDate && right.birthDate) {
    const dateComparison = right.birthDate.getTime() - left.birthDate.getTime();
    if (dateComparison !== 0) return dateComparison;
  } else if (left.birthDate && !right.birthDate) {
    return -1;
  } else if (!left.birthDate && right.birthDate) {
    return 1;
  }

  return left.primaryRegistrationNo.localeCompare(
    right.primaryRegistrationNo,
    "fi",
    { sensitivity: "base" },
  );
}

function compareRowsByCreatedDesc(left: RawDogRow, right: RawDogRow): number {
  const dateComparison = right.createdAt.getTime() - left.createdAt.getTime();
  if (dateComparison !== 0) return dateComparison;

  return right.id.localeCompare(left.id, "fi", { sensitivity: "base" });
}

function compareRowsByNameAsc(left: RawDogRow, right: RawDogRow): number {
  const nameComparison = left.name.localeCompare(right.name, "fi", {
    sensitivity: "base",
  });
  if (nameComparison !== 0) return nameComparison;

  return left.primaryRegistrationNo.localeCompare(
    right.primaryRegistrationNo,
    "fi",
    { sensitivity: "base" },
  );
}

function compareRowsByEkAsc(left: RawDogRow, right: RawDogRow): number {
  if (left.ekNo != null && right.ekNo != null) {
    const ekComparison = left.ekNo - right.ekNo;
    if (ekComparison !== 0) return ekComparison;
  } else if (left.ekNo != null && right.ekNo == null) {
    return -1;
  } else if (left.ekNo == null && right.ekNo != null) {
    return 1;
  }

  return left.id.localeCompare(right.id, "fi", { sensitivity: "base" });
}

export function sortRows(
  rows: RawDogRow[],
  sort: BeagleSearchSortDb,
): RawDogRow[] {
  const sortable = [...rows];
  if (sort === "created-desc") {
    return sortable.sort(compareRowsByCreatedDesc);
  }
  if (sort === "reg-desc") {
    return sortable.sort(compareRowsByRegistrationDesc);
  }
  if (sort === "birth-desc") {
    return sortable.sort(compareRowsByBirthDesc);
  }
  if (sort === "ek-asc") {
    return sortable.sort(compareRowsByEkAsc);
  }
  return sortable.sort(compareRowsByNameAsc);
}
