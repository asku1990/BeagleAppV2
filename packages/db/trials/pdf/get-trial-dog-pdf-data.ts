import { prisma } from "@db/core/prisma";
import type {
  TrialDogPdfDataRequest,
  TrialDogPdfPayloadWithTrialId,
  TrialDogSex,
} from "@contracts";
import { Prisma } from "@prisma/client";

function toNumberOrNull(value: Prisma.Decimal | null): number | null {
  return value === null ? null : value.toNumber();
}

export type TrialDogPdfDataDbRow = Omit<
  TrialDogPdfPayloadWithTrialId,
  "paljasMaaTaiLumi"
> & {
  keli: string | null;
};

export async function getTrialDogPdfDataDb(
  input: TrialDogPdfDataRequest,
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
    dogSex: (row.dog?.sex ?? null) as TrialDogSex | null,
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
  };
}
