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
      paljasMaa: true,
      lumikeli: true,
      rokotusOk: true,
      tunnistusOk: true,
      notes: true,
      yksilointiAvain: true,
      createdAt: true,
      updatedAt: true,
      trialEvent: {
        select: {
          sklKoeId: true,
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
    dogId: row.dogId ?? null,
    dogName:
      row.dog?.name?.trim() ||
      row.koiranNimiSnapshot?.trim() ||
      row.rekisterinumeroSnapshot,
    registrationNo:
      row.rekisterinumeroSnapshot ||
      row.dog?.registrations[0]?.registrationNo ||
      null,
    sklKoeId: row.trialEvent.sklKoeId ?? null,
    entryKey: row.yksilointiAvain,
    eventDate: row.trialEvent.koepaiva,
    eventName: row.trialEvent.jarjestaja,
    eventPlace: row.trialEvent.koekunta,
    kennelDistrict: row.trialEvent.kennelpiiri,
    kennelDistrictNo: row.trialEvent.kennelpiirinro,
    keli: row.keli,
    paljasMaa: row.paljasMaa,
    lumikeli: row.lumikeli,
    luokka: row.luokka,
    palkinto: row.palkinto,
    loppupisteet: toNumberOrNull(row.loppupisteet),
    sijoitus: row.sijoitus,
    hakuKeskiarvo: toNumberOrNull(row.hakuKeskiarvo),
    haukkuKeskiarvo: toNumberOrNull(row.haukkuKeskiarvo),
    yleisvaikutelmaPisteet: toNumberOrNull(row.yleisvaikutelmaPisteet),
    hakuloysyysTappioYhteensa: toNumberOrNull(row.hakuloysyysTappioYhteensa),
    ajoloysyysTappioYhteensa: toNumberOrNull(row.ajoloysyysTappioYhteensa),
    tieJaEstetyoskentelyPisteet: toNumberOrNull(
      row.tieJaEstetyoskentelyPisteet,
    ),
    metsastysintoPisteet: toNumberOrNull(row.metsastysintoPisteet),
    ylituomariNimi: row.trialEvent.ylituomariNimi,
    rokotusOk: row.rokotusOk,
    tunnistusOk: row.tunnistusOk,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
