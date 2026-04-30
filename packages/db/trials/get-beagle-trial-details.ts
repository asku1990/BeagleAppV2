// Reads public beagle trial detail from canonical TrialEvent+TrialEntry tables.
// Multiple TrialEvent rows can share the same (koepaiva, koekunta) — all matching
// events are folded into one public response to preserve the date/place URL scheme.
import { DogSex, type Prisma } from "@prisma/client";
import { prisma } from "../core/prisma";
import type {
  BeagleTrialDetailsRequestDb,
  BeagleTrialDetailsResponseDb,
  BeagleTrialDetailsRowDb,
} from "./types";

function toNumberOrNull(
  value: Prisma.Decimal | null | undefined,
): number | null {
  if (value == null) return null;
  return value.toNumber();
}

function toSexCode(value: DogSex | null | undefined): "U" | "N" | "-" {
  if (value === DogSex.MALE) return "U";
  if (value === DogSex.FEMALE) return "N";
  return "-";
}

// Returns the shared judge name when all non-empty values agree, otherwise null.
function resolveJudge(names: (string | null | undefined)[]): string | null {
  const nonEmpty = names
    .map((n) => n?.trim())
    .filter((n): n is string => Boolean(n));
  if (nonEmpty.length === 0) return null;
  const unique = new Set(nonEmpty);
  return unique.size === 1 ? [...unique][0]! : null;
}

function compareDetailRows(
  left: BeagleTrialDetailsRowDb,
  right: BeagleTrialDetailsRowDb,
): number {
  const leftPoints = left.points ?? -1;
  const rightPoints = right.points ?? -1;
  if (leftPoints !== rightPoints) {
    return rightPoints - leftPoints;
  }

  const rankComparison = (left.rank ?? "").localeCompare(
    right.rank ?? "",
    "fi",
    { sensitivity: "base" },
  );
  if (rankComparison !== 0) return rankComparison;

  const nameComparison = left.name.localeCompare(right.name, "fi", {
    sensitivity: "base",
  });
  if (nameComparison !== 0) return nameComparison;

  return left.registrationNo.localeCompare(right.registrationNo, "fi", {
    sensitivity: "base",
  });
}

export async function getBeagleTrialDetailsDb(
  input: BeagleTrialDetailsRequestDb,
): Promise<BeagleTrialDetailsResponseDb | null> {
  const trialEvents = await prisma.trialEvent.findMany({
    where: {
      koepaiva: {
        gte: input.eventDateStart,
        lt: input.eventDateEndExclusive,
      },
      koekunta: input.eventPlace,
    },
    select: {
      koepaiva: true,
      koekunta: true,
      ylituomariNimi: true,
      entries: {
        select: {
          id: true,
          dogId: true,
          rekisterinumeroSnapshot: true,
          ke: true,
          pa: true,
          lk: true,
          sija: true,
          piste: true,
          tuom1: true,
          haku: true,
          hauk: true,
          yva: true,
          hlo: true,
          alo: true,
          tja: true,
          pin: true,
          dog: {
            select: {
              name: true,
              sex: true,
            },
          },
        },
      },
    },
  });

  if (trialEvents.length === 0) return null;

  // Fold entries from all matched events into a flat list so the public
  // date/place URL resolves consistently even when more than one TrialEvent
  // exists for the same koepaiva+koekunta.
  const allEntries = trialEvents.flatMap((event) =>
    event.entries.map((entry) => ({
      ...entry,
      eventYlituomariNimi: event.ylituomariNimi,
    })),
  );

  if (allEntries.length === 0) return null;

  // Event-level judge: use the shared chief judge only when every non-empty
  // ylituomariNimi value across matched events agrees.
  const eventJudge = resolveJudge(trialEvents.map((e) => e.ylituomariNimi));

  const items: BeagleTrialDetailsRowDb[] = allEntries
    .map((entry) => ({
      id: entry.id,
      dogId: entry.dogId,
      registrationNo: entry.rekisterinumeroSnapshot,
      // Prefer the linked dog name; fall back to registration snapshot so
      // entries without a dogId always render something meaningful.
      name: entry.dog?.name?.trim() || entry.rekisterinumeroSnapshot,
      sex: toSexCode(entry.dog?.sex),
      weather: entry.ke,
      award: entry.pa,
      classCode: entry.lk,
      rank: entry.sija,
      points: toNumberOrNull(entry.piste),
      // Per-entry group judge (tuom1) takes precedence over event chief judge.
      judge: entry.tuom1?.trim() || eventJudge || null,
      haku: toNumberOrNull(entry.haku),
      hauk: toNumberOrNull(entry.hauk),
      yva: toNumberOrNull(entry.yva),
      hlo: toNumberOrNull(entry.hlo),
      alo: toNumberOrNull(entry.alo),
      tja: toNumberOrNull(entry.tja),
      pin: toNumberOrNull(entry.pin),
    }))
    .sort(compareDetailRows);

  return {
    eventDate: trialEvents[0]!.koepaiva,
    eventPlace: trialEvents[0]!.koekunta,
    judge: eventJudge,
    dogCount: items.length,
    items,
  };
}
