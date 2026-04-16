import { TrialSourceTag } from "@prisma/client";
import { prisma } from "@db/core/prisma";

export type KoiratietokantaAjokEventDbInput = {
  sklKoeId: number;
  koepaiva: Date;
  koekunta: string;
  jarjestaja: string | null;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  koemuoto: string | null;
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
  hakuEra1: number | null;
  hakuEra2: number | null;
  hakuEra3: number | null;
  hakuEra4: number | null;
  hakuKeskiarvo: number | null;
  haukkuEra1: number | null;
  haukkuEra2: number | null;
  haukkuEra3: number | null;
  haukkuEra4: number | null;
  haukkuKeskiarvo: number | null;
  ajotaitoEra1: number | null;
  ajotaitoEra2: number | null;
  ajotaitoEra3: number | null;
  ajotaitoEra4: number | null;
  ajotaitoKeskiarvo: number | null;
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
  koiriaLuokassa: number | null;
  keli: string | null;
  luopui: boolean | null;
  suljettu: boolean | null;
  keskeytetty: boolean | null;
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

export type KoiratietokantaAjokUpsertDbInput = {
  event: KoiratietokantaAjokEventDbInput;
  entry: KoiratietokantaAjokEntryDbInput;
  lisatiedot: KoiratietokantaAjokLisatietoDbInput[];
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
        koemuoto: input.event.koemuoto,
        rotukoodi: null,
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
        koemuoto: input.event.koemuoto,
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
      luokka: input.entry.luokka,
      omistajaSnapshot: input.entry.omistajaSnapshot,
      omistajanKotikuntaSnapshot: input.entry.omistajanKotikuntaSnapshot,
      era1Alkoi: input.entry.era1Alkoi,
      era2Alkoi: input.entry.era2Alkoi,
      era3Alkoi: input.entry.era3Alkoi,
      era4Alkoi: input.entry.era4Alkoi,
      hakuMin1: input.entry.hakuMin1,
      hakuMin2: input.entry.hakuMin2,
      hakuMin3: input.entry.hakuMin3,
      hakuMin4: input.entry.hakuMin4,
      ajoMin1: input.entry.ajoMin1,
      ajoMin2: input.entry.ajoMin2,
      ajoMin3: input.entry.ajoMin3,
      ajoMin4: input.entry.ajoMin4,
      hyvaksytytAjominuutit: input.entry.hyvaksytytAjominuutit,
      ajoajanPisteet: input.entry.ajoajanPisteet,
      hakuEra1: input.entry.hakuEra1,
      hakuEra2: input.entry.hakuEra2,
      hakuEra3: input.entry.hakuEra3,
      hakuEra4: input.entry.hakuEra4,
      hakuKeskiarvo: input.entry.hakuKeskiarvo,
      haukkuEra1: input.entry.haukkuEra1,
      haukkuEra2: input.entry.haukkuEra2,
      haukkuEra3: input.entry.haukkuEra3,
      haukkuEra4: input.entry.haukkuEra4,
      haukkuKeskiarvo: input.entry.haukkuKeskiarvo,
      ajotaitoEra1: input.entry.ajotaitoEra1,
      ajotaitoEra2: input.entry.ajotaitoEra2,
      ajotaitoEra3: input.entry.ajotaitoEra3,
      ajotaitoEra4: input.entry.ajotaitoEra4,
      ajotaitoKeskiarvo: input.entry.ajotaitoKeskiarvo,
      ansiopisteetYhteensa: input.entry.ansiopisteetYhteensa,
      hakuloysyysTappioEra1: input.entry.hakuloysyysTappioEra1,
      hakuloysyysTappioEra2: input.entry.hakuloysyysTappioEra2,
      hakuloysyysTappioEra3: input.entry.hakuloysyysTappioEra3,
      hakuloysyysTappioEra4: input.entry.hakuloysyysTappioEra4,
      hakuloysyysTappioYhteensa: input.entry.hakuloysyysTappioYhteensa,
      ajoloysyysTappioEra1: input.entry.ajoloysyysTappioEra1,
      ajoloysyysTappioEra2: input.entry.ajoloysyysTappioEra2,
      ajoloysyysTappioEra3: input.entry.ajoloysyysTappioEra3,
      ajoloysyysTappioEra4: input.entry.ajoloysyysTappioEra4,
      ajoloysyysTappioYhteensa: input.entry.ajoloysyysTappioYhteensa,
      tappiopisteetYhteensa: input.entry.tappiopisteetYhteensa,
      loppupisteet: input.entry.loppupisteet,
      palkinto: input.entry.palkinto,
      sijoitus: input.entry.sijoitus,
      koiriaLuokassa: input.entry.koiriaLuokassa,
      keli: input.entry.keli,
      luopui: input.entry.luopui,
      suljettu: input.entry.suljettu,
      keskeytetty: input.entry.keskeytetty,
      huomautusTeksti: input.entry.huomautusTeksti,
      ylituomariNimiSnapshot: input.entry.ylituomariNimiSnapshot,
      ylituomariNumeroSnapshot: input.entry.ylituomariNumeroSnapshot,
      ryhmatuomariNimi: input.entry.ryhmatuomariNimi,
      palkintotuomariNimi: input.entry.palkintotuomariNimi,
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

    await tx.trialLisatietoItem.deleteMany({
      where: { trialEntryId: trialEntry.id },
    });
    if (input.lisatiedot.length > 0) {
      await tx.trialLisatietoItem.createMany({
        data: input.lisatiedot.map((item) => ({
          trialEntryId: trialEntry.id,
          koodi: item.koodi,
          nimi: item.nimi,
          era1Arvo: item.era1Arvo,
          era2Arvo: item.era2Arvo,
          era3Arvo: item.era3Arvo,
          era4Arvo: item.era4Arvo,
          jarjestys: item.jarjestys,
        })),
      });
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
