import { prisma } from "../../../core/prisma";

// Fetches existing canonical event/entry lookup keys used for duplicate and conflict checks.
export async function listExistingShowImportKeysDb(input: {
  eventLookupKeys: string[];
  entryLookupKeys: string[];
  eventDateIsos: string[];
}): Promise<{
  events: Array<{
    eventLookupKey: string;
    eventCity: string | null;
    eventType: string | null;
  }>;
  sameDayEvents: Array<{
    eventLookupKey: string;
    eventDate: Date;
  }>;
  entries: Array<{ entryLookupKey: string }>;
}> {
  const eventDates = input.eventDateIsos.map(
    (value) => new Date(`${value}T00:00:00.000Z`),
  );

  const [events, sameDayEvents, entries] = await Promise.all([
    prisma.showEvent.findMany({
      where: { eventLookupKey: { in: input.eventLookupKeys } },
      select: { eventLookupKey: true, eventCity: true, eventType: true },
    }),
    prisma.showEvent.findMany({
      where: { eventDate: { in: eventDates } },
      select: { eventLookupKey: true, eventDate: true },
    }),
    prisma.showEntry.findMany({
      where: { entryLookupKey: { in: input.entryLookupKeys } },
      select: { entryLookupKey: true },
    }),
  ]);
  return { events, sameDayEvents, entries };
}
