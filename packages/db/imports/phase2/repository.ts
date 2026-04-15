import { TrialSourceTag } from "@prisma/client";
import { prisma } from "../../core/prisma";

// Persistence helpers for legacy phase2 canonical trial import writes/metrics.
// Keeps Prisma access in @beagle/db while server layer orchestrates flow and mapping.
type TrialEventUpsertInput = {
  legacyEventKey: string;
  koepaiva: Date;
  koekunta: string;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  ylituomariNimi: string | null;
};

type TrialEntryUpsertInput = {
  trialEventId: string;
  dogId: string | null;
  rekisterinumeroSnapshot: string;
  yksilointiAvain: string;
  raakadataJson: string;
  palkinto: string | null;
  sijoitus: string | null;
  loppupisteet: number | null;
  hakuKeskiarvo: number | null;
  haukkuKeskiarvo: number | null;
  hakuloysyysTappioYhteensa: number | null;
  ajoloysyysTappioYhteensa: number | null;
  keli: string | null;
  luopui: boolean | null;
  suljettu: boolean | null;
  keskeytetty: boolean | null;
  notes: string | null;
};

export async function listPhase2DogRegistrationsDb(): Promise<
  Array<{ registrationNo: string; dogId: string }>
> {
  return prisma.dogRegistration.findMany({
    select: { registrationNo: true, dogId: true },
  });
}

export async function countTrialResultRowsDb(): Promise<number> {
  return prisma.trialResult.count();
}

export async function countTrialEntryRowsDb(): Promise<number> {
  return prisma.trialEntry.count();
}

export async function upsertTrialEventByLegacyKeyDb(
  input: TrialEventUpsertInput,
): Promise<{ id: string }> {
  return prisma.trialEvent.upsert({
    where: { legacyEventKey: input.legacyEventKey },
    create: {
      sklKoeId: null,
      legacyEventKey: input.legacyEventKey,
      koepaiva: input.koepaiva,
      koekunta: input.koekunta,
      jarjestaja: null,
      kennelpiiri: input.kennelpiiri,
      kennelpiirinro: input.kennelpiirinro,
      koemuoto: "AJOK",
      rotukoodi: null,
      ylituomariNimi: input.ylituomariNimi,
      ylituomariNumero: null,
      ytKertomus: null,
    },
    update: {
      koepaiva: input.koepaiva,
      koekunta: input.koekunta,
      kennelpiiri: input.kennelpiiri,
      kennelpiirinro: input.kennelpiirinro,
      koemuoto: "AJOK",
      ...(input.ylituomariNimi !== null
        ? { ylituomariNimi: input.ylituomariNimi }
        : {}),
    },
    select: { id: true },
  });
}

export async function upsertTrialEntryByEventAndRegistrationDb(
  input: TrialEntryUpsertInput,
): Promise<void> {
  await prisma.trialEntry.upsert({
    where: {
      trialEventId_rekisterinumeroSnapshot: {
        trialEventId: input.trialEventId,
        rekisterinumeroSnapshot: input.rekisterinumeroSnapshot,
      },
    },
    create: {
      trialEventId: input.trialEventId,
      dogId: input.dogId,
      rekisterinumeroSnapshot: input.rekisterinumeroSnapshot,
      yksilointiAvain: input.yksilointiAvain,
      lahde: TrialSourceTag.LEGACY_AKOEALL,
      raakadataJson: input.raakadataJson,
      koiranNimiSnapshot: null,
      omistajaSnapshot: null,
      palkinto: input.palkinto,
      sijoitus: input.sijoitus,
      koiriaLuokassa: null,
      loppupisteet: input.loppupisteet,
      hakuMin1: null,
      hakuMin2: null,
      hakuMin3: null,
      hakuMin4: null,
      ajoMin1: null,
      ajoMin2: null,
      ajoMin3: null,
      ajoMin4: null,
      hakuKeskiarvo: input.hakuKeskiarvo,
      haukkuKeskiarvo: input.haukkuKeskiarvo,
      ajotaitoKeskiarvo: null,
      hakuloysyysTappioYhteensa: input.hakuloysyysTappioYhteensa,
      ajoloysyysTappioYhteensa: input.ajoloysyysTappioYhteensa,
      keli: input.keli,
      luopui: input.luopui,
      suljettu: input.suljettu,
      keskeytetty: input.keskeytetty,
      huomautusTeksti: null,
      notes: input.notes,
    },
    update: {
      dogId: input.dogId,
      yksilointiAvain: input.yksilointiAvain,
      lahde: TrialSourceTag.LEGACY_AKOEALL,
      raakadataJson: input.raakadataJson,
      palkinto: input.palkinto,
      sijoitus: input.sijoitus,
      loppupisteet: input.loppupisteet,
      hakuKeskiarvo: input.hakuKeskiarvo,
      haukkuKeskiarvo: input.haukkuKeskiarvo,
      hakuloysyysTappioYhteensa: input.hakuloysyysTappioYhteensa,
      ajoloysyysTappioYhteensa: input.ajoloysyysTappioYhteensa,
      keli: input.keli,
      luopui: input.luopui,
      suljettu: input.suljettu,
      keskeytetty: input.keskeytetty,
      notes: input.notes,
    },
  });
}
