import type { Prisma } from "@prisma/client";
import {
  addBusinessIsoDateDays,
  getBusinessDateStartUtc,
  toBusinessDateOnly,
} from "@db/core/date-only";

export type EventTargetInput = {
  eventKey?: string | null;
  eventDate: Date;
  eventPlace: string;
};

function toEventWhere(
  input: EventTargetInput,
): Prisma.ShowEventWhereInput | null {
  if (input.eventKey) {
    return { eventLookupKey: input.eventKey };
  }

  const eventDateIso = toBusinessDateOnly(input.eventDate);
  const rangeStart = getBusinessDateStartUtc(eventDateIso);
  const nextEventDateIso = addBusinessIsoDateDays(eventDateIso, 1);
  const rangeEnd = nextEventDateIso
    ? getBusinessDateStartUtc(nextEventDateIso)
    : null;

  if (!rangeStart || !rangeEnd) {
    return null;
  }

  return {
    eventDate: {
      gte: rangeStart,
      lt: rangeEnd,
    },
    eventPlace: input.eventPlace,
  };
}

// Resolves a show event selector consistently across admin show manage writes,
// using event key when available and date/place fallback otherwise.
export async function resolveAdminShowEventTargetDb<T>(
  tx: Prisma.TransactionClient,
  input: EventTargetInput,
  select: Prisma.ShowEventSelect,
): Promise<T | null> {
  const where = toEventWhere(input);
  if (!where) {
    return null;
  }

  if (input.eventKey) {
    return (await tx.showEvent.findFirst({
      where,
      select,
    })) as T | null;
  }

  const rows = (await tx.showEvent.findMany({
    where,
    take: 2,
    select,
  })) as T[];

  return rows.length === 1 ? (rows[0] ?? null) : null;
}
