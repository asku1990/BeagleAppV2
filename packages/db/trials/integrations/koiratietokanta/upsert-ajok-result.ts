import {
  TrialEntryHuomautus,
  TrialEntryKoetyyppi,
  TrialSourceTag,
} from "@prisma/client";
import { prisma } from "@db/core/prisma";

export type KoiratietokantaAjokEventDbInput = {
  sklKoeId: number;
  koepaiva: Date;
  koekunta: string;
  jarjestaja: string | null;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  trialRuleWindowId: string | null;
  ylituomariNimi: string | null;
  ylituomariNumero: string | null;
  ytKertomus: string | null;
};

export type KoiratietokantaAjokEntryDbInput = {
  rekisterinumeroSnapshot: string;
  yksilointiAvain: string;
  raakadataJson: string;
  luokka: string | null;
  omistajaSnapshot: string | null;
  omistajanKotikuntaSnapshot: string | null;
  koemaasto: string | null;
  era1Alkoi: string | null;
  era2Alkoi: string | null;
  era3Alkoi: string | null;
  era4Alkoi: string | null;
  hakuMin1: number | null;
  hakuMin2: number | null;
  hakuMin3: number | null;
  hakuMin4: number | null;
  ajoMin1: number | null;
  ajoMin2: number | null;
  ajoMin3: number | null;
  ajoMin4: number | null;
  hyvaksytytAjominuutit: number | null;
  ajoajanPisteet: number | null;
  pin: number | null;
  hakuEra1: number | null;
  hakuEra2: number | null;
  hakuEra3: number | null;
  hakuEra4: number | null;
  haku: number | null;
  haukkuEra1: number | null;
  haukkuEra2: number | null;
  haukkuEra3: number | null;
  haukkuEra4: number | null;
  hauk: number | null;
  ajotaitoEra1: number | null;
  ajotaitoEra2: number | null;
  ajotaitoEra3: number | null;
  ajotaitoEra4: number | null;
  yva: number | null;
  hlo: number | null;
  alo: number | null;
  ansiopisteetYhteensa: number | null;
  hakuloysyysTappioEra1: number | null;
  hakuloysyysTappioEra2: number | null;
  hakuloysyysTappioEra3: number | null;
  hakuloysyysTappioEra4: number | null;
  hakuloysyysTappioYhteensa: number | null;
  ajoloysyysTappioEra1: number | null;
  ajoloysyysTappioEra2: number | null;
  ajoloysyysTappioEra3: number | null;
  ajoloysyysTappioEra4: number | null;
  ajoloysyysTappioYhteensa: number | null;
  tappiopisteetYhteensa: number | null;
  loppupisteet: number | null;
  palkinto: string | null;
  sijoitus: string | null;
  koemuoto: string | null;
  koiriaLuokassa: number | null;
  koetyyppi: TrialEntryKoetyyppi;
  keli: string | null;
  huomautus: TrialEntryHuomautus | null;
  huomautusTeksti: string | null;
  ylituomariNimiSnapshot: string | null;
  ylituomariNumeroSnapshot: string | null;
  ryhmatuomariNimi: string | null;
  palkintotuomariNimi: string | null;
};

export type KoiratietokantaAjokLisatietoDbInput = {
  koodi: string;
  nimi: string;
  era1Arvo: string | null;
  era2Arvo: string | null;
  era3Arvo: string | null;
  era4Arvo: string | null;
  jarjestys: number | null;
};

export type KoiratietokantaAjokEraLisatietoDbInput = {
  koodi: string;
  nimi: string;
  arvo: string;
  jarjestys: number | null;
};

export type KoiratietokantaAjokEraDbInput = {
  era: number;
  alkoi: string | null;
  hakumin: number | null;
  ajomin: number | null;
  haku: number | null;
  hauk: number | null;
  yva: number | null;
  hlo: number | null;
  alo: number | null;
  lisatiedot: KoiratietokantaAjokEraLisatietoDbInput[];
};

export type KoiratietokantaAjokUpsertDbInput = {
  event: KoiratietokantaAjokEventDbInput;
  entry: KoiratietokantaAjokEntryDbInput;
  eras: KoiratietokantaAjokEraDbInput[];
};

export type KoiratietokantaAjokUpsertDbResult = {
  trialEventId: string;
  trialEntryId: string;
  created: boolean;
  updated: boolean;
  dogFound: boolean;
};

// Persists one accepted AJOK result from the Koiratietokanta integration.
// Owns the event/entry idempotency boundary and preserves existing dog links.
export async function upsertKoiratietokantaAjokResultDb(
  input: KoiratietokantaAjokUpsertDbInput,
): Promise<KoiratietokantaAjokUpsertDbResult> {
  return prisma.$transaction(async (tx) => {
    const trialEvent = await tx.trialEvent.upsert({
      where: { sklKoeId: input.event.sklKoeId },
      create: {
        sklKoeId: input.event.sklKoeId,
        legacyEventKey: null,
        koepaiva: input.event.koepaiva,
        koekunta: input.event.koekunta,
        jarjestaja: input.event.jarjestaja,
        kennelpiiri: input.event.kennelpiiri,
        kennelpiirinro: input.event.kennelpiirinro,
        trialRuleWindowId: input.event.trialRuleWindowId,
        ylituomariNimi: input.event.ylituomariNimi,
        ylituomariNumero: input.event.ylituomariNumero,
        ytKertomus: input.event.ytKertomus,
      },
      update: {
        koepaiva: input.event.koepaiva,
        koekunta: input.event.koekunta,
        jarjestaja: input.event.jarjestaja,
        kennelpiiri: input.event.kennelpiiri,
        kennelpiirinro: input.event.kennelpiirinro,
        trialRuleWindowId: input.event.trialRuleWindowId,
        ytKertomus: input.event.ytKertomus,
        ylituomariNimi: input.event.ylituomariNimi,
        ylituomariNumero: input.event.ylituomariNumero,
      },
      select: { id: true },
    });

    const dogRegistration = await tx.dogRegistration.findUnique({
      where: { registrationNo: input.entry.rekisterinumeroSnapshot },
      select: { dogId: true },
    });
    const dogId = dogRegistration?.dogId ?? null;

    const existingEntry = await tx.trialEntry.findUnique({
      where: {
        trialEventId_rekisterinumeroSnapshot: {
          trialEventId: trialEvent.id,
          rekisterinumeroSnapshot: input.entry.rekisterinumeroSnapshot,
        },
      },
      select: { id: true },
    });

    const entryWrite = {
      yksilointiAvain: input.entry.yksilointiAvain,
      lahde: TrialSourceTag.KOIRATIETOKANTA_API,
      raakadataJson: input.entry.raakadataJson,
      ke: input.entry.keli,
      lk: input.entry.luokka,
      koemuoto: input.entry.koemuoto,
      koiriaLuokassa: input.entry.koiriaLuokassa,
      koetyyppi: input.entry.koetyyppi,
      omistajaSnapshot: input.entry.omistajaSnapshot,
      omistajanKotikuntaSnapshot: input.entry.omistajanKotikuntaSnapshot,
      koemaasto: input.entry.koemaasto,
      rotukoodi: null,
      pa: input.entry.palkinto,
      piste: input.entry.loppupisteet,
      sija: input.entry.sijoitus,
      hyvaksytytAjominuutit: input.entry.hyvaksytytAjominuutit,
      ajoajanPisteet: input.entry.ajoajanPisteet,
      pin: input.entry.pin,
      haku: input.entry.haku,
      hauk: input.entry.hauk,
      yva: input.entry.yva,
      hlo: input.entry.hlo,
      alo: input.entry.alo,
      ansiopisteetYhteensa: input.entry.ansiopisteetYhteensa,
      tappiopisteetYhteensa: input.entry.tappiopisteetYhteensa,
      tuom1: input.event.ylituomariNimi,
      huomautus: input.entry.huomautus,
      ...(dogId ? { dogId } : {}),
    };

    const trialEntry = await tx.trialEntry.upsert({
      where: {
        trialEventId_rekisterinumeroSnapshot: {
          trialEventId: trialEvent.id,
          rekisterinumeroSnapshot: input.entry.rekisterinumeroSnapshot,
        },
      },
      create: {
        trialEventId: trialEvent.id,
        rekisterinumeroSnapshot: input.entry.rekisterinumeroSnapshot,
        dogId,
        ...entryWrite,
      },
      update: entryWrite,
      select: { id: true },
    });

    await tx.trialEra.deleteMany({
      where: { trialEntryId: trialEntry.id },
    });

    for (const eraWrite of input.eras) {
      const era = await tx.trialEra.create({
        data: {
          trialEntryId: trialEntry.id,
          era: eraWrite.era,
          alkoi: eraWrite.alkoi,
          hakumin: eraWrite.hakumin,
          ajomin: eraWrite.ajomin,
          haku: eraWrite.haku,
          hauk: eraWrite.hauk,
          yva: eraWrite.yva,
          hlo: eraWrite.hlo,
          alo: eraWrite.alo,
          raakadataJson: null,
        },
        select: { id: true, era: true },
      });

      const eraLisatiedot = eraWrite.lisatiedot.map((item) => ({
        trialEraId: era.id,
        koodi: item.koodi,
        arvo: item.arvo,
        nimi: item.nimi,
        jarjestys: item.jarjestys,
      }));

      if (eraLisatiedot.length > 0) {
        await tx.trialEraLisatieto.createMany({
          data: eraLisatiedot,
        });
      }
    }

    return {
      trialEventId: trialEvent.id,
      trialEntryId: trialEntry.id,
      created: !existingEntry,
      updated: Boolean(existingEntry),
      dogFound: Boolean(dogId),
    };
  });
}
