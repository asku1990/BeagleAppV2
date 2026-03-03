import { DogSex } from "@prisma/client";
import type { BeagleSearchRowDb } from "../search/repository";
import type { RawDogRow } from "./dog-row-loader";

function toSexCode(value: DogSex): "U" | "N" | "-" {
  if (value === DogSex.MALE) return "U";
  if (value === DogSex.FEMALE) return "N";
  return "-";
}

export function toSearchRow(row: RawDogRow): BeagleSearchRowDb {
  return {
    id: row.id,
    ekNo: row.ekNo,
    registrationNo: row.primaryRegistrationNo,
    registrationNos: row.registrationNos,
    createdAt: row.createdAt,
    sex: toSexCode(row.sex),
    name: row.name,
    birthDate: row.birthDate,
    sire: row.sire,
    dam: row.dam,
    trialCount: row.trialCount,
    showCount: row.showCount,
  };
}
