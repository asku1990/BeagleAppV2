import { ADMIN_WRITE_TX_CONFIG } from "@db/core/interactive-write-transaction";
import { prisma } from "@db/core/prisma";

export type DeleteAdminTrialEventWriteRequestDb = {
  trialEventId: string;
};

export type DeleteAdminTrialEventWriteResultDb =
  | { status: "not_found" }
  | { status: "not_empty" }
  | { status: "deleted"; deletedTrialEventId: string };

// Enforces the empty-only event deletion rule in the database write itself.
export async function deleteAdminTrialEventWriteDb(
  input: DeleteAdminTrialEventWriteRequestDb,
): Promise<DeleteAdminTrialEventWriteResultDb> {
  return prisma.$transaction(async (tx) => {
    const deleted = await tx.trialEvent.deleteMany({
      where: {
        id: input.trialEventId,
        entries: { none: {} },
      },
    });

    if (deleted.count > 0) {
      return {
        status: "deleted",
        deletedTrialEventId: input.trialEventId,
      };
    }

    const existing = await tx.trialEvent.findUnique({
      where: { id: input.trialEventId },
      select: { id: true },
    });

    return existing ? { status: "not_empty" } : { status: "not_found" };
  }, ADMIN_WRITE_TX_CONFIG);
}
