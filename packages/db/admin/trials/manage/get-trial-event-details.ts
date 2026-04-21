import type { Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";
import type {
  AdminTrialEventDetailsDb,
  AdminTrialEventDetailsRequestDb,
} from "./types";

function toNumberOrNull(value: Prisma.Decimal | null): number | null {
  if (value === null) {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function getAdminTrialEventDetailsDb(
  input: AdminTrialEventDetailsRequestDb,
): Promise<AdminTrialEventDetailsDb | null> {
  const row = await prisma.trialEvent.findUnique({
    where: {
      id: input.trialEventId,
    },
    select: {
      id: true,
      sklKoeId: true,
      koepaiva: true,
      koekunta: true,
      jarjestaja: true,
      koemuoto: true,
      ylituomariNimi: true,
      entries: {
        orderBy: [{ rekisterinumeroSnapshot: "asc" }, { id: "asc" }],
        select: {
          id: true,
          dogId: true,
          yksilointiAvain: true,
          rekisterinumeroSnapshot: true,
          koiranNimiSnapshot: true,
          sijoitus: true,
          palkinto: true,
          loppupisteet: true,
          ryhmatuomariNimi: true,
          dog: {
            select: {
              name: true,
              registrations: {
                select: {
                  registrationNo: true,
                },
                orderBy: [{ createdAt: "asc" }, { id: "asc" }],
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!row) {
    return null;
  }

  return {
    trialEventId: row.id,
    eventDate: row.koepaiva,
    eventPlace: row.koekunta,
    eventName: row.jarjestaja,
    organizer: row.jarjestaja,
    judge: row.ylituomariNimi,
    sklKoeId: row.sklKoeId,
    koemuoto: row.koemuoto,
    entries: row.entries.map((entry) => ({
      trialId: entry.id,
      dogId: entry.dogId,
      dogName:
        entry.dog?.name?.trim() ||
        entry.koiranNimiSnapshot?.trim() ||
        entry.rekisterinumeroSnapshot,
      registrationNo:
        entry.rekisterinumeroSnapshot ||
        entry.dog?.registrations[0]?.registrationNo ||
        null,
      entryKey: entry.yksilointiAvain,
      rank: entry.sijoitus,
      award: entry.palkinto,
      points: toNumberOrNull(entry.loppupisteet),
      judge: entry.ryhmatuomariNimi || row.ylituomariNimi,
    })),
  };
}
