import { prisma } from "@db/core/prisma";

export type CreateAdminTrialEventWriteRequestDb = {
  eventDate: Date;
  eventPlace: string;
  jarjestaja: string | null;
  ylituomari: string | null;
  ylituomariNumero: string | null;
  ytKertomus: string | null;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  sklKoeId: number;
  trialRuleWindowId: string | null;
};

export type CreateAdminTrialEventWriteResultDb = {
  trialEventId: string;
};

// Creates one canonical event without child result rows.
export async function createAdminTrialEventWriteDb(
  input: CreateAdminTrialEventWriteRequestDb,
): Promise<CreateAdminTrialEventWriteResultDb> {
  const created = await prisma.trialEvent.create({
    data: {
      koepaiva: input.eventDate,
      koekunta: input.eventPlace,
      jarjestaja: input.jarjestaja,
      ylituomariNimi: input.ylituomari,
      ylituomariNumero: input.ylituomariNumero,
      ytKertomus: input.ytKertomus,
      kennelpiiri: input.kennelpiiri,
      kennelpiirinro: input.kennelpiirinro,
      sklKoeId: input.sklKoeId,
      trialRuleWindowId: input.trialRuleWindowId,
    },
    select: {
      id: true,
    },
  });

  return { trialEventId: created.id };
}
