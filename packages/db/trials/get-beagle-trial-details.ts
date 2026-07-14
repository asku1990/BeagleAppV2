// Reads a public beagle trial detail from a single canonical TrialEvent row.
// Entries are loaded only through TrialEntry.trialEventId so the response maps
// exactly to one event, even when other events share the same date/place.
import { DogSex, DogStatus, type Prisma } from "@prisma/client";
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
  const trialEvent = await prisma.trialEvent.findUnique({
    where: { id: input.trialEventId },
    select: {
      id: true,
      koepaiva: true,
      koekunta: true,
      ylituomariNimi: true,
      trialRuleWindowId: true,
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
              status: true,
            },
          },
        },
      },
    },
  });

  if (!trialEvent) return null;
  if (trialEvent.entries.length === 0) return null;

  const eventJudge = resolveJudge([trialEvent.ylituomariNimi]);

  const items: BeagleTrialDetailsRowDb[] = trialEvent.entries
    .map((entry) => ({
      id: entry.id,
      trialRuleWindowId: trialEvent.trialRuleWindowId,
      dogId: entry.dog?.status === DogStatus.NORMAL ? entry.dogId : null,
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
      // Dog-row judge prefers the entry-level judge, then falls back to event judge.
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
    trialEventId: trialEvent.id,
    eventDate: trialEvent.koepaiva,
    eventPlace: trialEvent.koekunta,
    judge: eventJudge,
    dogCount: items.length,
    items,
  };
}
