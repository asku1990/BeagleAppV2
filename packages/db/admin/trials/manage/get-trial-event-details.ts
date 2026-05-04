import type { Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";
import type {
  AdminTrialEventDetailsDb,
  AdminTrialEventDetailsRequestDb,
} from "./types";

function toNumberOrNull(value: Prisma.Decimal | null): number | null {
  if (value === null) {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function getAdminTrialEventDetailsDb(
  input: AdminTrialEventDetailsRequestDb,
): Promise<AdminTrialEventDetailsDb | null> {
  const row = await prisma.trialEvent.findUnique({
    where: {
      id: input.trialEventId,
    },
    select: {
      id: true,
      sklKoeId: true,
      koepaiva: true,
      koekunta: true,
      jarjestaja: true,
      kennelpiiri: true,
      kennelpiirinro: true,
      ylituomariNimi: true,
      ylituomariNumero: true,
      ytKertomus: true,
      entries: {
        orderBy: [{ rekisterinumeroSnapshot: "asc" }, { id: "asc" }],
        select: {
          id: true,
          dogId: true,
          yksilointiAvain: true,
          rekisterinumeroSnapshot: true,
          koemaasto: true,
          koemuoto: true,
          koiriaLuokassa: true,
          ke: true,
          lk: true,
          koetyyppi: true,
          sija: true,
          pa: true,
          piste: true,
          hyvaksytytAjominuutit: true,
          ajoajanPisteet: true,
          haku: true,
          hauk: true,
          yva: true,
          hlo: true,
          alo: true,
          tja: true,
          pin: true,
          ansiopisteetYhteensa: true,
          tappiopisteetYhteensa: true,
          tuom1: true,
          huomautus: true,
          huomautusTeksti: true,
          ylituomariNimiSnapshot: true,
          ylituomariNumeroSnapshot: true,
          ryhmatuomariNimi: true,
          palkintotuomariNimi: true,
          omistajaSnapshot: true,
          omistajanKotikuntaSnapshot: true,
          eras: {
            orderBy: [{ era: "asc" }, { id: "asc" }],
            select: {
              era: true,
              alkoi: true,
              hakumin: true,
              ajomin: true,
              haku: true,
              hauk: true,
              yva: true,
              hlo: true,
              alo: true,
              tja: true,
              pin: true,
              huomautusTeksti: true,
              lisatiedot: {
                orderBy: [{ koodi: "asc" }, { osa: "asc" }, { id: "asc" }],
                select: {
                  koodi: true,
                  osa: true,
                  arvo: true,
                  nimi: true,
                  jarjestys: true,
                },
              },
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
      },
    },
  });

  if (!row) {
    return null;
  }

  return {
    trialEventId: row.id,
    eventDate: row.koepaiva,
    eventPlace: row.koekunta,
    eventName: row.jarjestaja,
    jarjestaja: row.jarjestaja,
    ylituomari: row.ylituomariNimi,
    ylituomariNumero: row.ylituomariNumero,
    ytKertomus: row.ytKertomus,
    kennelpiiri: row.kennelpiiri,
    kennelpiirinro: row.kennelpiirinro,
    sklKoeId: row.sklKoeId,
    entries: row.entries.map((entry) => ({
      trialId: entry.id,
      dogId: entry.dogId,
      dogName: entry.dog?.name?.trim() || entry.rekisterinumeroSnapshot,
      registrationNo:
        entry.rekisterinumeroSnapshot ||
        entry.dog?.registrations[0]?.registrationNo ||
        null,
      entryKey: entry.yksilointiAvain,
      koemuoto: entry.koemuoto,
      koetyyppi: entry.koetyyppi,
      rank: entry.sija,
      award: entry.pa,
      points: toNumberOrNull(entry.piste),
      judge: entry.tuom1 || row.ylituomariNimi,
      koemaasto: entry.koemaasto ?? null,
      koiriaLuokassa: entry.koiriaLuokassa ?? null,
      ke: entry.ke ?? null,
      lk: entry.lk ?? null,
      hyvaksytytAjominuutit: entry.hyvaksytytAjominuutit ?? null,
      ajoajanPisteet: toNumberOrNull(entry.ajoajanPisteet ?? null),
      haku: toNumberOrNull(entry.haku ?? null),
      hauk: toNumberOrNull(entry.hauk ?? null),
      yva: toNumberOrNull(entry.yva ?? null),
      hlo: toNumberOrNull(entry.hlo ?? null),
      alo: toNumberOrNull(entry.alo ?? null),
      tja: toNumberOrNull(entry.tja ?? null),
      pin: toNumberOrNull(entry.pin ?? null),
      ansiopisteetYhteensa: toNumberOrNull(entry.ansiopisteetYhteensa ?? null),
      tappiopisteetYhteensa: toNumberOrNull(
        entry.tappiopisteetYhteensa ?? null,
      ),
      huomautus: entry.huomautus ?? null,
      huomautusTeksti: entry.huomautusTeksti ?? null,
      ylituomariNimiSnapshot: entry.ylituomariNimiSnapshot ?? null,
      ylituomariNumeroSnapshot: entry.ylituomariNumeroSnapshot ?? null,
      ryhmatuomariNimi: entry.ryhmatuomariNimi ?? null,
      palkintotuomariNimi: entry.palkintotuomariNimi ?? null,
      omistajaSnapshot: entry.omistajaSnapshot ?? null,
      omistajanKotikuntaSnapshot: entry.omistajanKotikuntaSnapshot ?? null,
      eras: (entry.eras ?? []).map((era) => ({
        era: era.era,
        alkoi: era.alkoi,
        hakumin: era.hakumin,
        ajomin: era.ajomin,
        haku: toNumberOrNull(era.haku),
        hauk: toNumberOrNull(era.hauk),
        yva: toNumberOrNull(era.yva),
        hlo: toNumberOrNull(era.hlo),
        alo: toNumberOrNull(era.alo),
        tja: toNumberOrNull(era.tja),
        pin: toNumberOrNull(era.pin),
        huomautusTeksti: era.huomautusTeksti,
        lisatiedot: (era.lisatiedot ?? []).map((item) => ({
          koodi: item.koodi,
          osa: item.osa,
          arvo: item.arvo,
          nimi: item.nimi,
          jarjestys: item.jarjestys,
        })),
      })),
    })),
  };
}
