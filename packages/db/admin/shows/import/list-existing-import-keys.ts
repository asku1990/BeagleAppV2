import { prisma } from "../../../core/prisma";

// Fetches existing canonical event/entry lookup keys used for duplicate and conflict checks.
export async function listExistingShowImportKeysDb(input: {
  eventLookupKeys: string[];
  entryLookupKeys: string[];
}): Promise<{
  events: Array<{
    eventLookupKey: string;
    eventCity: string | null;
    eventType: string | null;
  }>;
  entries: Array<{ entryLookupKey: string }>;
}> {
  const [events, entries] = await Promise.all([
    prisma.showEvent.findMany({
      where: { eventLookupKey: { in: input.eventLookupKeys } },
      select: { eventLookupKey: true, eventCity: true, eventType: true },
    }),
    prisma.showEntry.findMany({
      where: { entryLookupKey: { in: input.entryLookupKeys } },
      select: { entryLookupKey: true },
    }),
  ]);
  return { events, entries };
}
