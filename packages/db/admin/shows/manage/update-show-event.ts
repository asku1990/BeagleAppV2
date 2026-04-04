import type { Prisma } from "@prisma/client";
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
    entries: {
      select: {
        id: true,
        entryLookupKey: true,
        registrationNoSnapshot: true,
        resultItems: {
          select: {
            id: true,
            itemLookupKey: true,
          },
        },
      },
    },
  } satisfies Prisma.ShowEventSelect;

  return resolveAdminShowEventTargetDb<{
    id: string;
    eventLookupKey: string;
    entries: Array<{
      id: string;
      entryLookupKey: string;
      registrationNoSnapshot: string;
      resultItems: Array<{
        id: string;
        itemLookupKey: string;
      }>;
    }>;
  }>(tx, input, select);
}

function replaceLookupPrefix(
  currentLookupKey: string,
  currentPrefix: string,
  nextPrefix: string,
): string {
  const expectedPrefix = `${currentPrefix}|`;
  if (!currentLookupKey.startsWith(expectedPrefix)) {
    return currentLookupKey;
  }

  return `${nextPrefix}|${currentLookupKey.slice(expectedPrefix.length)}`;
}

async function syncLookupKeysAfterEventMove(
  tx: Prisma.TransactionClient,
  input: {
    currentEventLookupKey: string;
    nextEventLookupKey: string;
    entries: Array<{
      id: string;
      entryLookupKey: string;
      registrationNoSnapshot: string;
      resultItems: Array<{
        id: string;
        itemLookupKey: string;
      }>;
    }>;
  },
): Promise<void> {
  if (input.currentEventLookupKey === input.nextEventLookupKey) {
    return;
  }

  for (const entry of input.entries) {
    const nextEntryLookupKey = `${entry.registrationNoSnapshot}|${input.nextEventLookupKey}`;
    if (entry.entryLookupKey !== nextEntryLookupKey) {
      await tx.showEntry.update({
        where: { id: entry.id },
        data: { entryLookupKey: nextEntryLookupKey },
      });
    }

    for (const resultItem of entry.resultItems) {
      const nextItemLookupKey = replaceLookupPrefix(
        resultItem.itemLookupKey,
        entry.entryLookupKey,
        nextEntryLookupKey,
      );
      if (resultItem.itemLookupKey === nextItemLookupKey) {
        continue;
      }

      await tx.showResultItem.update({
        where: { id: resultItem.id },
        data: { itemLookupKey: nextItemLookupKey },
      });
    }
  }
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
      currentEventLookupKey: targetEvent.eventLookupKey,
      nextEventLookupKey: input.nextEventLookupKey,
      entries: targetEvent.entries,
    });

    const row: UpdatedAdminShowEventRowDb = {
      eventKey: updatedEvent.eventLookupKey,
      eventDate: updatedEvent.eventDate,
      eventPlace: updatedEvent.eventPlace,
      eventCity: updatedEvent.eventCity,
      eventName: updatedEvent.eventName,
      eventType: updatedEvent.eventType,
      organizer: updatedEvent.organizer,
    };

    return { status: "updated", row };
  });
}
