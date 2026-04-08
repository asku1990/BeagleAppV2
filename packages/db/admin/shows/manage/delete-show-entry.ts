import { prisma } from "@db/core/prisma";
import { ADMIN_WRITE_TX_CONFIG } from "@db/core/interactive-write-transaction";
import { resolveAdminShowEventTargetDb } from "./internal/event-target";
import type {
  DeleteAdminShowEntryWriteRequestDb,
  DeleteAdminShowEntryWriteResultDb,
} from "./types";

async function resolveEventId(
  tx: Parameters<typeof resolveAdminShowEventTargetDb>[0],
  input: Pick<
    DeleteAdminShowEntryWriteRequestDb,
    "eventKey" | "eventDate" | "eventPlace"
  >,
): Promise<string | null> {
  const event = await resolveAdminShowEventTargetDb<{ id: string }>(tx, input, {
    id: true,
  });
  return event?.id ?? null;
}

// Deletes one admin show entry scoped to the selected event.
export async function deleteAdminShowEntryWriteDb(
  input: DeleteAdminShowEntryWriteRequestDb,
): Promise<DeleteAdminShowEntryWriteResultDb> {
  return prisma.$transaction(async (tx) => {
    const eventId = await resolveEventId(tx, {
      eventKey: input.eventKey,
      eventDate: input.eventDate,
      eventPlace: input.eventPlace,
    });
    if (!eventId) {
      return { status: "not_found" };
    }

    const deleteResult = await tx.showEntry.deleteMany({
      where: {
        id: input.entryId,
        showEventId: eventId,
      },
    });
    if (deleteResult.count === 0) {
      return { status: "not_found" };
    }

    return {
      status: "deleted",
      entryId: input.entryId,
    };
  }, ADMIN_WRITE_TX_CONFIG);
}
