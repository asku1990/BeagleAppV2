import { prisma } from "@db/core/prisma";
import type { Prisma, TrialEntryHuomautus } from "@prisma/client";

function toNumberOrNull(value: Prisma.Decimal | null): number | null {
  return value === null ? null : value.toNumber();
}

export type TrialDogPdfDataDbInput = {
  trialId: string;
};

export type TrialDogPdfDataDbDogSex = "MALE" | "FEMALE" | "UNKNOWN";

export type TrialDogPdfDataDbEraLisatietoRow = {
  koodi: string;
  arvo: string;
};

export type TrialDogPdfDataDbEraRow = {
  era: number;
  alkoi: string | null;
  hakumin: number | null;
  ajomin: number | null;
  haku: number | null;
  hauk: number | null;
  yva: number | null;
  hlo: number | null;
  alo: number | null;
  lisatiedot: TrialDogPdfDataDbEraLisatietoRow[];
};

export type TrialDogPdfDataDbRow = {
  trialId: string;
  trialRuleWindowId: string | null;
  registrationNo: string;
  dogName: string | null;
  dogSex: TrialDogPdfDataDbDogSex | null;
  sireName: string | null;
  sireRegistrationNo: string | null;
  damName: string | null;
  damRegistrationNo: string | null;
  omistaja: string | null;
  omistajanKotikunta: string | null;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  koekunta: string | null;
  koemaasto: string | null;
  koepaiva: Date;
  jarjestaja: string | null;
  hyvaksytytAjominuutit: number | null;
  ajoajanPisteet: number | null;
  haku: number | null;
  hauk: number | null;
  yva: number | null;
  hlo: number | null;
  alo: number | null;
  pin: number | null;
  ansiopisteetYhteensa: number | null;
  tappiopisteetYhteensa: number | null;
  loppupisteet: number | null;
  ke: string | null;
  huomautus: TrialEntryHuomautus | null;
  huomautusTeksti: string | null;
  koetyyppi: "NORMAL" | "KOKOKAUDENKOE" | "PITKAKOE";
  sijoitus: string | null;
  koiriaLuokassa: number | null;
  palkinto: string | null;
  ylituomariNimi: string | null;
  ylituomariNumeroSnapshot: string | null;
  ylituomariNimiSnapshot: string | null;
  ryhmatuomariNimi: string | null;
  palkintotuomariNimi: string | null;
  eras: TrialDogPdfDataDbEraRow[];
};

export async function getTrialDogPdfDataDb(
  input: TrialDogPdfDataDbInput,
): Promise<TrialDogPdfDataDbRow | null> {
  const row = await prisma.trialEntry.findUnique({
    where: {
      id: input.trialId,
    },
    select: {
      id: true,
      rekisterinumeroSnapshot: true,
      omistajaSnapshot: true,
      omistajanKotikuntaSnapshot: true,
      koemaasto: true,
      ke: true,
      huomautus: true,
      huomautusTeksti: true,
      koetyyppi: true,
      pa: true,
      piste: true,
      sija: true,
      koiriaLuokassa: true,
      hyvaksytytAjominuutit: true,
      ajoajanPisteet: true,
      haku: true,
      hauk: true,
      yva: true,
      hlo: true,
      alo: true,
      pin: true,
      ansiopisteetYhteensa: true,
      tappiopisteetYhteensa: true,
      tuom1: true,
      ylituomariNimiSnapshot: true,
      ylituomariNumeroSnapshot: true,
      ryhmatuomariNimi: true,
      palkintotuomariNimi: true,
      dog: {
        select: {
          name: true,
          sex: true,
          registrations: {
            select: {
              registrationNo: true,
            },
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            take: 1,
          },
          sire: {
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
          dam: {
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
      trialEvent: {
        select: {
          trialRuleWindowId: true,
          kennelpiiri: true,
          kennelpiirinro: true,
          koekunta: true,
          koepaiva: true,
          jarjestaja: true,
        },
      },
      eras: {
        orderBy: {
          era: "asc",
        },
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
          lisatiedot: {
            orderBy: {
              koodi: "asc",
            },
            select: {
              koodi: true,
              arvo: true,
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
    trialId: row.id,
    trialRuleWindowId: row.trialEvent.trialRuleWindowId,
    registrationNo:
      row.dog?.registrations[0]?.registrationNo || row.rekisterinumeroSnapshot,
    dogName: row.dog?.name || null,
    dogSex: (row.dog?.sex ?? null) as TrialDogPdfDataDbDogSex | null,
    sireName: row.dog?.sire?.name ?? null,
    sireRegistrationNo: row.dog?.sire?.registrations[0]?.registrationNo ?? null,
    damName: row.dog?.dam?.name ?? null,
    damRegistrationNo: row.dog?.dam?.registrations[0]?.registrationNo ?? null,
    omistaja: row.omistajaSnapshot ?? null,
    omistajanKotikunta: row.omistajanKotikuntaSnapshot ?? null,
    kennelpiiri: row.trialEvent.kennelpiiri ?? null,
    kennelpiirinro: row.trialEvent.kennelpiirinro ?? null,
    koekunta: row.trialEvent.koekunta ?? null,
    koemaasto: row.koemaasto ?? null,
    koepaiva: row.trialEvent.koepaiva,
    jarjestaja: row.trialEvent.jarjestaja ?? null,
    hyvaksytytAjominuutit: row.hyvaksytytAjominuutit,
    ajoajanPisteet: toNumberOrNull(row.ajoajanPisteet),
    haku: toNumberOrNull(row.haku),
    hauk: toNumberOrNull(row.hauk),
    yva: toNumberOrNull(row.yva),
    hlo: toNumberOrNull(row.hlo),
    alo: toNumberOrNull(row.alo),
    pin: toNumberOrNull(row.pin),
    ansiopisteetYhteensa: toNumberOrNull(row.ansiopisteetYhteensa),
    tappiopisteetYhteensa: toNumberOrNull(row.tappiopisteetYhteensa),
    loppupisteet: toNumberOrNull(row.piste),
    ke: row.ke,
    huomautus: row.huomautus,
    huomautusTeksti: row.huomautusTeksti,
    koetyyppi: row.koetyyppi,
    sijoitus: row.sija ?? null,
    koiriaLuokassa: row.koiriaLuokassa,
    palkinto: row.pa ?? null,
    ylituomariNimi: row.tuom1 ?? null,
    ylituomariNumeroSnapshot: row.ylituomariNumeroSnapshot,
    ylituomariNimiSnapshot: row.ylituomariNimiSnapshot,
    ryhmatuomariNimi: row.ryhmatuomariNimi,
    palkintotuomariNimi: row.palkintotuomariNimi,
    eras: row.eras.map((era) => ({
      era: era.era,
      alkoi: era.alkoi,
      hakumin: era.hakumin,
      ajomin: era.ajomin,
      haku: toNumberOrNull(era.haku),
      hauk: toNumberOrNull(era.hauk),
      yva: toNumberOrNull(era.yva),
      hlo: toNumberOrNull(era.hlo),
      alo: toNumberOrNull(era.alo),
      lisatiedot: era.lisatiedot,
    })),
  };
}
