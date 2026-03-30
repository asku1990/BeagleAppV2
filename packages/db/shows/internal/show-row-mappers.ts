import { DogSex } from "@prisma/client";
import type { BeagleShowDetailsRowDb } from "../types";

export function toSexCode(value: DogSex): "U" | "N" | "-" {
  if (value === DogSex.MALE) return "U";
  if (value === DogSex.FEMALE) return "N";
  return "-";
}

export function parseHeightCm(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function compareDetailRows(
  left: BeagleShowDetailsRowDb,
  right: BeagleShowDetailsRowDb,
): number {
  const sexOrder: Record<BeagleShowDetailsRowDb["sex"], number> = {
    U: 0,
    N: 1,
    "-": 2,
  };
  const sexComparison = sexOrder[left.sex] - sexOrder[right.sex];
  if (sexComparison !== 0) return sexComparison;

  const showTypeComparison = (left.showType ?? "").localeCompare(
    right.showType ?? "",
    "fi",
    { sensitivity: "base" },
  );
  if (showTypeComparison !== 0) return showTypeComparison;

  const qualityComparison = (left.qualityGrade ?? "").localeCompare(
    right.qualityGrade ?? "",
    "fi",
    { sensitivity: "base" },
  );
  if (qualityComparison !== 0) return qualityComparison;

  const placementComparison =
    (left.classPlacement ?? Number.POSITIVE_INFINITY) -
    (right.classPlacement ?? Number.POSITIVE_INFINITY);
  if (placementComparison !== 0) return placementComparison;

  const pupnComparison = (left.pupn ?? "").localeCompare(
    right.pupn ?? "",
    "fi",
    {
      sensitivity: "base",
    },
  );
  if (pupnComparison !== 0) return pupnComparison;

  const awardsComparison = left.awards
    .join(", ")
    .localeCompare(right.awards.join(", "), "fi", {
      sensitivity: "base",
    });
  if (awardsComparison !== 0) return awardsComparison;

  const nameComparison = left.name.localeCompare(right.name, "fi", {
    sensitivity: "base",
  });
  if (nameComparison !== 0) return nameComparison;

  return left.registrationNo.localeCompare(right.registrationNo, "fi", {
    sensitivity: "base",
  });
}
