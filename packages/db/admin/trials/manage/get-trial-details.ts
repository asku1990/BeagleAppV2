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
  const row = await prisma.trialEntry.findUnique({
    where: {
      id: input.trialId,
    },
    select: {
      id: true,
      dogId: true,
      rekisterinumeroSnapshot: true,
      koiranNimiSnapshot: true,
      luokka: true,
      palkinto: true,
      loppupisteet: true,
      sijoitus: true,
      hakuKeskiarvo: true,
      haukkuKeskiarvo: true,
      yleisvaikutelmaPisteet: true,
      hakuloysyysTappioYhteensa: true,
      ajoloysyysTappioYhteensa: true,
      tieJaEstetyoskentelyPisteet: true,
      metsastysintoPisteet: true,
      keli: true,
      notes: true,
      yksilointiAvain: true,
      createdAt: true,
      updatedAt: true,
      trialEvent: {
        select: {
          koepaiva: true,
          koekunta: true,
          jarjestaja: true,
          kennelpiiri: true,
          kennelpiirinro: true,
          ylituomariNimi: true,
        },
      },
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
    dogId: row.dogId ?? "",
    dogName:
      row.dog?.name?.trim() ||
      row.koiranNimiSnapshot?.trim() ||
      row.rekisterinumeroSnapshot,
    registrationNo:
      row.rekisterinumeroSnapshot ||
      row.dog?.registrations[0]?.registrationNo ||
      null,
    eventDate: row.trialEvent.koepaiva,
    eventName: row.trialEvent.jarjestaja,
    eventPlace: row.trialEvent.koekunta,
    kennelDistrict: row.trialEvent.kennelpiiri,
    kennelDistrictNo: row.trialEvent.kennelpiirinro,
    ke: row.keli,
    lk: row.luokka,
    pa: row.palkinto,
    piste: toNumberOrNull(row.loppupisteet),
    sija: row.sijoitus,
    haku: toNumberOrNull(row.hakuKeskiarvo),
    hauk: toNumberOrNull(row.haukkuKeskiarvo),
    yva: toNumberOrNull(row.yleisvaikutelmaPisteet),
    hlo: toNumberOrNull(row.hakuloysyysTappioYhteensa),
    alo: toNumberOrNull(row.ajoloysyysTappioYhteensa),
    tja: toNumberOrNull(row.tieJaEstetyoskentelyPisteet),
    pin: toNumberOrNull(row.metsastysintoPisteet),
    judge: row.trialEvent.ylituomariNimi,
    legacyFlag: row.notes,
    sourceKey: row.yksilointiAvain,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
