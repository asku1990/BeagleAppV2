import { prisma } from "@db/core/prisma";
import { Prisma } from "@prisma/client";

function toNumberOrNull(value: Prisma.Decimal | null): number | null {
  return value === null ? null : value.toNumber();
}

export type TrialDogPdfDataDbInput = {
  trialId: string;
};

export type TrialDogPdfDataDbDogSex = "MALE" | "FEMALE" | "UNKNOWN";

export type TrialDogPdfDataDbLisatietoRow = {
  koodi: string;
  era1Arvo: string | null;
  era2Arvo: string | null;
};

export type TrialDogPdfDataDbRow = {
  trialId: string;
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
  koepaiva: Date;
  jarjestaja: string | null;
  era1Alkoi: string | null;
  era2Alkoi: string | null;
  hakuMin1: number | null;
  hakuMin2: number | null;
  ajoMin1: number | null;
  ajoMin2: number | null;
  hyvaksytytAjominuutit: number | null;
  ajoajanPisteet: number | null;
  hakuEra1: number | null;
  hakuEra2: number | null;
  hakuKeskiarvo: number | null;
  haukkuEra1: number | null;
  haukkuEra2: number | null;
  haukkuKeskiarvo: number | null;
  ajotaitoEra1: number | null;
  ajotaitoEra2: number | null;
  ajotaitoKeskiarvo: number | null;
  hakuloysyysTappioEra1: number | null;
  hakuloysyysTappioEra2: number | null;
  hakuloysyysTappioYhteensa: number | null;
  ajoloysyysTappioEra1: number | null;
  ajoloysyysTappioEra2: number | null;
  ajoloysyysTappioYhteensa: number | null;
  tappiopisteetYhteensa: number | null;
  ansiopisteetYhteensa: number | null;
  loppupisteet: number | null;
  keli: string | null;
  luopui: boolean | null;
  suljettu: boolean | null;
  keskeytetty: boolean | null;
  sijoitus: string | null;
  koiriaLuokassa: number | null;
  palkinto: string | null;
  huomautusTeksti: string | null;

  ryhmatuomariNimi: string | null;
  palkintotuomariNimi: string | null;
  ylituomariNumeroSnapshot: string | null;
  ylituomariNimiSnapshot: string | null;
  lisatiedotRows: TrialDogPdfDataDbLisatietoRow[];
};

const OLOSUHDE_KOODIT = [
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
] as const;

const HAKU_KOODIT = ["20", "21", "22"] as const;
const HAUKKU_KOODIT = ["30", "31", "32", "33", "34", "35", "36"] as const;
const METSASTYSINTO_KOODIT = ["40", "41", "42"] as const;
const AJO_KOODIT = ["50", "51", "52", "53", "54", "55", "56"] as const;

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
          kennelpiiri: true,
          kennelpiirinro: true,
          koekunta: true,
          koepaiva: true,
          jarjestaja: true,
        },
      },
      era1Alkoi: true,
      era2Alkoi: true,
      hakuMin1: true,
      hakuMin2: true,
      ajoMin1: true,
      ajoMin2: true,
      hyvaksytytAjominuutit: true,
      ajoajanPisteet: true,
      hakuEra1: true,
      hakuEra2: true,
      hakuKeskiarvo: true,
      haukkuEra1: true,
      haukkuEra2: true,
      haukkuKeskiarvo: true,
      ajotaitoEra1: true,
      ajotaitoEra2: true,
      ajotaitoKeskiarvo: true,
      hakuloysyysTappioEra1: true,
      hakuloysyysTappioEra2: true,
      hakuloysyysTappioYhteensa: true,
      ajoloysyysTappioEra1: true,
      ajoloysyysTappioEra2: true,
      ajoloysyysTappioYhteensa: true,
      tappiopisteetYhteensa: true,
      ansiopisteetYhteensa: true,
      loppupisteet: true,
      keli: true,
      luopui: true,
      suljettu: true,
      keskeytetty: true,
      sijoitus: true,
      koiriaLuokassa: true,
      palkinto: true,
      huomautusTeksti: true,
      ryhmatuomariNimi: true,
      palkintotuomariNimi: true,
      ylituomariNumeroSnapshot: true,
      ylituomariNimiSnapshot: true,
      lisatiedot: {
        where: {
          koodi: {
            in: [
              ...OLOSUHDE_KOODIT,
              ...HAKU_KOODIT,
              ...HAUKKU_KOODIT,
              ...METSASTYSINTO_KOODIT,
              ...AJO_KOODIT,
            ],
          },
        },
        select: {
          koodi: true,
          era1Arvo: true,
          era2Arvo: true,
        },
        orderBy: {
          koodi: "asc",
        },
      },
    },
  });

  if (!row) {
    return null;
  }

  return {
    trialId: row.id,
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
    koepaiva: row.trialEvent.koepaiva,
    jarjestaja: row.trialEvent.jarjestaja ?? null,
    era1Alkoi: row.era1Alkoi ?? null,
    era2Alkoi: row.era2Alkoi ?? null,
    hakuMin1: row.hakuMin1 ?? null,
    hakuMin2: row.hakuMin2 ?? null,
    ajoMin1: row.ajoMin1 ?? null,
    ajoMin2: row.ajoMin2 ?? null,
    hyvaksytytAjominuutit: row.hyvaksytytAjominuutit ?? null,
    ajoajanPisteet: toNumberOrNull(row.ajoajanPisteet),
    hakuEra1: toNumberOrNull(row.hakuEra1),
    hakuEra2: toNumberOrNull(row.hakuEra2),
    hakuKeskiarvo: toNumberOrNull(row.hakuKeskiarvo),
    haukkuEra1: toNumberOrNull(row.haukkuEra1),
    haukkuEra2: toNumberOrNull(row.haukkuEra2),
    haukkuKeskiarvo: toNumberOrNull(row.haukkuKeskiarvo),
    ajotaitoEra1: toNumberOrNull(row.ajotaitoEra1),
    ajotaitoEra2: toNumberOrNull(row.ajotaitoEra2),
    ajotaitoKeskiarvo: toNumberOrNull(row.ajotaitoKeskiarvo),
    hakuloysyysTappioEra1: toNumberOrNull(row.hakuloysyysTappioEra1),
    hakuloysyysTappioEra2: toNumberOrNull(row.hakuloysyysTappioEra2),
    hakuloysyysTappioYhteensa: toNumberOrNull(row.hakuloysyysTappioYhteensa),
    ajoloysyysTappioEra1: toNumberOrNull(row.ajoloysyysTappioEra1),
    ajoloysyysTappioEra2: toNumberOrNull(row.ajoloysyysTappioEra2),
    ajoloysyysTappioYhteensa: toNumberOrNull(row.ajoloysyysTappioYhteensa),
    tappiopisteetYhteensa: toNumberOrNull(row.tappiopisteetYhteensa),
    ansiopisteetYhteensa: toNumberOrNull(row.ansiopisteetYhteensa),
    loppupisteet: toNumberOrNull(row.loppupisteet),
    keli: row.keli,
    luopui: row.luopui,
    suljettu: row.suljettu,
    keskeytetty: row.keskeytetty,
    sijoitus: row.sijoitus,
    koiriaLuokassa: row.koiriaLuokassa,
    palkinto: row.palkinto,
    huomautusTeksti: row.huomautusTeksti,
    ryhmatuomariNimi: row.ryhmatuomariNimi ?? null,
    palkintotuomariNimi: row.palkintotuomariNimi ?? null,
    ylituomariNumeroSnapshot: row.ylituomariNumeroSnapshot ?? null,
    ylituomariNimiSnapshot: row.ylituomariNimiSnapshot ?? null,
    lisatiedotRows: row.lisatiedot.map((item) => ({
      koodi: item.koodi,
      era1Arvo: item.era1Arvo ?? null,
      era2Arvo: item.era2Arvo ?? null,
    })),
  };
}
