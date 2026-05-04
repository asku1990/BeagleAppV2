import { prisma } from "@db/core/prisma";
import { ADMIN_WRITE_TX_CONFIG } from "@db/core/interactive-write-transaction";

export type DeleteAdminTrialEntryWriteRequestDb = {
  trialEventId: string;
  trialEntryId: string;
};

export type DeleteAdminTrialEntryWriteResultDb =
  | { status: "not_found" }
  | {
      status: "deleted";
      deletedTrialEntryId: string;
      trialEventId: string;
      deletedTrialEvent: boolean;
    };

// modification: deleting TrialEntry cascades to TrialEra and TrialEraLisatieto.
// If this was the last entry, remove the now-empty TrialEvent as cleanup.
export async function deleteAdminTrialEntryWriteDb(
  input: DeleteAdminTrialEntryWriteRequestDb,
): Promise<DeleteAdminTrialEntryWriteResultDb> {
  return prisma.$transaction(async (tx) => {
    const deleted = await tx.trialEntry.deleteMany({
      where: {
        id: input.trialEntryId,
        trialEventId: input.trialEventId,
      },
    });

    if (deleted.count === 0) {
      return { status: "not_found" };
    }

    const remainingEntries = await tx.trialEntry.count({
      where: {
        trialEventId: input.trialEventId,
      },
    });

    let deletedTrialEvent = false;
    if (remainingEntries === 0) {
      await tx.trialEvent.delete({
        where: {
          id: input.trialEventId,
        },
      });
      deletedTrialEvent = true;
    }

    return {
      status: "deleted",
      deletedTrialEntryId: input.trialEntryId,
      trialEventId: input.trialEventId,
      deletedTrialEvent,
    };
  }, ADMIN_WRITE_TX_CONFIG);
}
