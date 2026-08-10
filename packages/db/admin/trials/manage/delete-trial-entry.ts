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

// Deleting TrialEntry cascades to TrialEra and TrialEraLisatieto.
// The parent event intentionally remains persisted when the final entry is removed.
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

    return {
      status: "deleted",
      deletedTrialEntryId: input.trialEntryId,
      trialEventId: input.trialEventId,
      deletedTrialEvent: false,
    };
  }, ADMIN_WRITE_TX_CONFIG);
}
