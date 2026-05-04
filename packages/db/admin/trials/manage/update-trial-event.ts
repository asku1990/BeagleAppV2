import { ADMIN_WRITE_TX_CONFIG } from "@db/core/interactive-write-transaction";
import { prisma } from "@db/core/prisma";

export type UpdateAdminTrialEventWriteRequestDb = {
  trialEventId: string;
  eventDate: Date;
  eventPlace: string;
  jarjestaja: string | null;
  ylituomari: string | null;
  ylituomariNumero: string | null;
  ytKertomus: string | null;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  sklKoeId: number | null;
};

export type UpdateAdminTrialEventWriteResultDb =
  | { status: "not_found" }
  | { status: "updated"; trialEventId: string };

// Updates canonical TrialEvent metadata only. Child entry/result rows are untouched.
export async function updateAdminTrialEventWriteDb(
  input: UpdateAdminTrialEventWriteRequestDb,
): Promise<UpdateAdminTrialEventWriteResultDb> {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.trialEvent.updateMany({
      where: {
        id: input.trialEventId,
      },
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
      },
    });

    if (updated.count === 0) {
      return { status: "not_found" };
    }

    return {
      status: "updated",
      trialEventId: input.trialEventId,
    };
  }, ADMIN_WRITE_TX_CONFIG);
}
