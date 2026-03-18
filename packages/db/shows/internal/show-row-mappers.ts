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

  const resultComparison = (left.result ?? "").localeCompare(
    right.result ?? "",
    "fi",
    {
      sensitivity: "base",
    },
  );
  if (resultComparison !== 0) return resultComparison;

  const nameComparison = left.name.localeCompare(right.name, "fi", {
    sensitivity: "base",
  });
  if (nameComparison !== 0) return nameComparison;

  return left.registrationNo.localeCompare(right.registrationNo, "fi", {
    sensitivity: "base",
  });
}
