import { Prisma } from "@prisma/client";
import { ADMIN_WRITE_TX_CONFIG } from "@db/core/interactive-write-transaction";
import { prisma } from "@db/core/prisma";
import { resolveAdminShowEventTargetDb } from "./internal/event-target";
import type {
  UpdatedAdminShowEventRowDb,
  UpdateAdminShowEventWriteRequestDb,
  UpdateAdminShowEventWriteResultDb,
} from "./types";

// Updates one show event and, when identity changes, rewrites dependent
// entry/item lookup keys so canonical lookup key invariants stay consistent.
async function resolveTargetEvent(
  tx: Prisma.TransactionClient,
  input: Pick<
    UpdateAdminShowEventWriteRequestDb,
    "eventKey" | "eventDate" | "eventPlace"
  >,
) {
  const select = {
    id: true,
    eventLookupKey: true,
  } satisfies Prisma.ShowEventSelect;

  return resolveAdminShowEventTargetDb<{
    id: string;
    eventLookupKey: string;
  }>(tx, input, select);
}

async function syncLookupKeysAfterEventMove(
  tx: Prisma.TransactionClient,
  input: {
    eventId: string;
    currentEventLookupKey: string;
    nextEventLookupKey: string;
  },
): Promise<void> {
  if (input.currentEventLookupKey === input.nextEventLookupKey) {
    return;
  }

  await tx.$executeRaw(
    Prisma.sql`
      WITH moved_entries AS (
        SELECT
          entry.id,
          entry."entryLookupKey" AS current_entry_lookup_key,
          entry."registrationNoSnapshot" || '|' || ${input.nextEventLookupKey} AS next_entry_lookup_key
        FROM "ShowEntry" entry
        WHERE entry."showEventId" = ${input.eventId}
      ),
      updated_entries AS (
        UPDATE "ShowEntry" entry
        SET "entryLookupKey" = moved_entries.next_entry_lookup_key
        FROM moved_entries
        WHERE entry.id = moved_entries.id
          AND entry."entryLookupKey" <> moved_entries.next_entry_lookup_key
        RETURNING
          entry.id,
          moved_entries.current_entry_lookup_key,
          moved_entries.next_entry_lookup_key
      )
      UPDATE "ShowResultItem" item
      SET "itemLookupKey" = updated_entries.next_entry_lookup_key || substring(
        item."itemLookupKey"
        FROM char_length(updated_entries.current_entry_lookup_key) + 2
      )
      FROM updated_entries
      WHERE item."showEntryId" = updated_entries.id
        AND left(
          item."itemLookupKey",
          char_length(updated_entries.current_entry_lookup_key) + 1
        ) = updated_entries.current_entry_lookup_key || '|'
        AND item."itemLookupKey" <> updated_entries.next_entry_lookup_key || substring(
          item."itemLookupKey"
          FROM char_length(updated_entries.current_entry_lookup_key) + 2
        )
    `,
  );
}

async function syncEntryJudgeAfterEventUpdate(
  tx: Prisma.TransactionClient,
  input: {
    eventId: string;
    targetJudge: string | null;
  },
): Promise<void> {
  await tx.showEntry.updateMany({
    where: {
      showEventId: input.eventId,
      ...(input.targetJudge === null
        ? { judge: { not: null } }
        : {
            OR: [{ judge: null }, { judge: { not: input.targetJudge } }],
          }),
    },
    data: { judge: input.targetJudge },
  });
}

export async function updateAdminShowEventWriteDb(
  input: UpdateAdminShowEventWriteRequestDb,
): Promise<UpdateAdminShowEventWriteResultDb> {
  return prisma.$transaction(async (tx) => {
    const targetEvent = await resolveTargetEvent(tx, {
      eventKey: input.eventKey,
      eventDate: input.eventDate,
      eventPlace: input.eventPlace,
    });
    if (!targetEvent) {
      return { status: "not_found" };
    }

    if (targetEvent.eventLookupKey !== input.nextEventLookupKey) {
      const conflictingEvent = await tx.showEvent.findUnique({
        where: { eventLookupKey: input.nextEventLookupKey },
        select: { id: true },
      });

      if (conflictingEvent && conflictingEvent.id !== targetEvent.id) {
        return { status: "event_lookup_conflict" };
      }
    }

    const updatedEvent = await tx.showEvent.update({
      where: { id: targetEvent.id },
      data: {
        eventLookupKey: input.nextEventLookupKey,
        eventDate: input.nextEventDate,
        eventPlace: input.nextEventPlace,
        eventCity: input.nextEventCity,
        eventName: input.nextEventName,
        eventType: input.nextEventType,
        organizer: input.nextOrganizer,
      },
      select: {
        eventLookupKey: true,
        eventDate: true,
        eventPlace: true,
        eventCity: true,
        eventName: true,
        eventType: true,
        organizer: true,
      },
    });

    await syncLookupKeysAfterEventMove(tx, {
      eventId: targetEvent.id,
      currentEventLookupKey: targetEvent.eventLookupKey,
      nextEventLookupKey: input.nextEventLookupKey,
    });
    await syncEntryJudgeAfterEventUpdate(tx, {
      eventId: targetEvent.id,
      targetJudge: input.nextJudge,
    });

    const row: UpdatedAdminShowEventRowDb = {
      eventKey: updatedEvent.eventLookupKey,
      eventDate: updatedEvent.eventDate,
      eventPlace: updatedEvent.eventPlace,
      eventCity: updatedEvent.eventCity,
      eventName: updatedEvent.eventName,
      eventType: updatedEvent.eventType,
      organizer: updatedEvent.organizer,
      judge: input.nextJudge,
    };

    return { status: "updated", row };
  }, ADMIN_WRITE_TX_CONFIG);
}
