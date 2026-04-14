import type { Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";
import type { AdminTrialDetailsDb, AdminTrialDetailsRequestDb } from "./types";

function toNumberOrNull(value: Prisma.Decimal | null): number | null {
  if (value === null) {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function getAdminTrialDetailsDb(
  input: AdminTrialDetailsRequestDb,
): Promise<AdminTrialDetailsDb | null> {
  const row = await prisma.trialResult.findUnique({
    where: {
      id: input.trialId,
    },
    select: {
      id: true,
      dogId: true,
      eventDate: true,
      eventName: true,
      eventPlace: true,
      kennelDistrict: true,
      kennelDistrictNo: true,
      ke: true,
      lk: true,
      pa: true,
      piste: true,
      sija: true,
      haku: true,
      hauk: true,
      yva: true,
      hlo: true,
      alo: true,
      tja: true,
      pin: true,
      judge: true,
      legacyFlag: true,
      sourceKey: true,
      createdAt: true,
      updatedAt: true,
      dog: {
        select: {
          name: true,
          registrations: {
            select: {
              registrationNo: true,
            },
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            take: 1,
          },
        },
      },
    },
  });

  if (!row) {
    return null;
  }

  return {
    trialId: row.id,
    dogId: row.dogId,
    dogName: row.dog.name,
    registrationNo: row.dog.registrations[0]?.registrationNo ?? null,
    eventDate: row.eventDate,
    eventName: row.eventName,
    eventPlace: row.eventPlace,
    kennelDistrict: row.kennelDistrict,
    kennelDistrictNo: row.kennelDistrictNo,
    ke: row.ke,
    lk: row.lk,
    pa: row.pa,
    piste: toNumberOrNull(row.piste),
    sija: row.sija,
    haku: toNumberOrNull(row.haku),
    hauk: toNumberOrNull(row.hauk),
    yva: toNumberOrNull(row.yva),
    hlo: toNumberOrNull(row.hlo),
    alo: toNumberOrNull(row.alo),
    tja: toNumberOrNull(row.tja),
    pin: toNumberOrNull(row.pin),
    judge: row.judge,
    legacyFlag: row.legacyFlag,
    sourceKey: row.sourceKey,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
