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
      isanNimiSnapshot: true,
      isanRekisterinumeroSnapshot: true,
      emanNimiSnapshot: true,
      emanRekisterinumeroSnapshot: true,
      omistajaSnapshot: true,
      omistajanKotikuntaSnapshot: true,
      sukupuoliSnapshot: true,
      luokka: true,
      koiriaLuokassa: true,
      palkinto: true,
      loppupisteet: true,
      sijoitus: true,
      era1Alkoi: true,
      era2Alkoi: true,
      hakuMin1: true,
      hakuMin2: true,
      ajoMin1: true,
      ajoMin2: true,
      hyvaksytytAjominuutit: true,
      ajoajanPisteet: true,
      ansiopisteetYhteensa: true,
      hakuKeskiarvo: true,
      haukkuKeskiarvo: true,
      ajotaitoKeskiarvo: true,
      yleisvaikutelmaPisteet: true,
      hakuloysyysTappioYhteensa: true,
      ajoloysyysTappioYhteensa: true,
      tappiopisteetYhteensa: true,
      tieJaEstetyoskentelyPisteet: true,
      metsastysintoPisteet: true,
      keli: true,
      luopui: true,
      suljettu: true,
      keskeytetty: true,
      huomautusTeksti: true,
      ryhmatuomariNimi: true,
      palkintotuomariNimi: true,
      rokotusOk: true,
      tunnistusOk: true,
      raakadataJson: true,
      notes: true,
      lisatiedot: {
        select: {
          koodi: true,
          nimi: true,
          era1Arvo: true,
          era2Arvo: true,
          era3Arvo: true,
          era4Arvo: true,
          jarjestys: true,
        },
        orderBy: [{ jarjestys: "asc" }, { koodi: "asc" }],
      },
      yksilointiAvain: true,
      createdAt: true,
      updatedAt: true,
      trialEvent: {
        select: {
          sklKoeId: true,
          koepaiva: true,
          koekunta: true,
          jarjestaja: true,
          koemuoto: true,
          rotukoodi: true,
          kennelpiiri: true,
          kennelpiirinro: true,
          ylituomariNimi: true,
          ylituomariNumero: true,
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
    rotukoodi: row.trialEvent.rotukoodi,
    jarjestaja: row.trialEvent.jarjestaja,
    koemuoto: row.trialEvent.koemuoto,
    kennelDistrict: row.trialEvent.kennelpiiri,
    kennelDistrictNo: row.trialEvent.kennelpiirinro,
    ylituomariNumero: row.trialEvent.ylituomariNumero,
    keli: row.keli,
    luokka: row.luokka,
    koiriaLuokassa: row.koiriaLuokassa,
    palkinto: row.palkinto,
    loppupisteet: toNumberOrNull(row.loppupisteet),
    sijoitus: row.sijoitus,
    era1Alkoi: row.era1Alkoi,
    era2Alkoi: row.era2Alkoi,
    hakuMin1: row.hakuMin1,
    hakuMin2: row.hakuMin2,
    ajoMin1: row.ajoMin1,
    ajoMin2: row.ajoMin2,
    hyvaksytytAjominuutit: row.hyvaksytytAjominuutit,
    ajoajanPisteet: toNumberOrNull(row.ajoajanPisteet),
    ansiopisteetYhteensa: toNumberOrNull(row.ansiopisteetYhteensa),
    hakuKeskiarvo: toNumberOrNull(row.hakuKeskiarvo),
    haukkuKeskiarvo: toNumberOrNull(row.haukkuKeskiarvo),
    ajotaitoKeskiarvo: toNumberOrNull(row.ajotaitoKeskiarvo),
    yleisvaikutelmaPisteet: toNumberOrNull(row.yleisvaikutelmaPisteet),
    hakuloysyysTappioYhteensa: toNumberOrNull(row.hakuloysyysTappioYhteensa),
    ajoloysyysTappioYhteensa: toNumberOrNull(row.ajoloysyysTappioYhteensa),
    tappiopisteetYhteensa: toNumberOrNull(row.tappiopisteetYhteensa),
    tieJaEstetyoskentelyPisteet: toNumberOrNull(
      row.tieJaEstetyoskentelyPisteet,
    ),
    metsastysintoPisteet: toNumberOrNull(row.metsastysintoPisteet),
    ylituomariNimi: row.trialEvent.ylituomariNimi,
    ryhmatuomariNimi: row.ryhmatuomariNimi,
    palkintotuomariNimi: row.palkintotuomariNimi,
    isanNimi: row.isanNimiSnapshot,
    isanRekisterinumero: row.isanRekisterinumeroSnapshot,
    emanNimi: row.emanNimiSnapshot,
    emanRekisterinumero: row.emanRekisterinumeroSnapshot,
    omistaja: row.omistajaSnapshot,
    omistajanKotikunta: row.omistajanKotikuntaSnapshot,
    sukupuoli: row.sukupuoliSnapshot,
    rokotusOk: row.rokotusOk,
    tunnistusOk: row.tunnistusOk,
    luopui: row.luopui,
    suljettu: row.suljettu,
    keskeytetty: row.keskeytetty,
    huomautusTeksti: row.huomautusTeksti,
    lisatiedot: row.lisatiedot.map((item) => ({
      koodi: item.koodi,
      nimi: item.nimi,
      era1Arvo: item.era1Arvo,
      era2Arvo: item.era2Arvo,
      era3Arvo: item.era3Arvo,
      era4Arvo: item.era4Arvo,
      jarjestys: item.jarjestys ?? 0,
    })),
    rawPayloadJson: row.raakadataJson,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
