import { DogSex, type Prisma } from "@prisma/client";
import { prisma } from "../core/prisma";
import type {
  BeagleTrialDetailsRequestDb,
  BeagleTrialDetailsResponseDb,
  BeagleTrialDetailsRowDb,
} from "./types";

function toNumberOrNull(value: Prisma.Decimal | null): number | null {
  if (value === null) {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function toSexCode(value: DogSex): "U" | "N" | "-" {
  if (value === DogSex.MALE) return "U";
  if (value === DogSex.FEMALE) return "N";
  return "-";
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
    {
      sensitivity: "base",
    },
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
  const rows = await prisma.trialResult.findMany({
    where: {
      eventDate: {
        gte: input.eventDateStart,
        lt: input.eventDateEndExclusive,
      },
      eventPlace: input.eventPlace,
    },
    include: {
      dog: {
        select: {
          id: true,
          name: true,
          sex: true,
          registrations: {
            select: {
              registrationNo: true,
            },
            orderBy: [{ createdAt: "asc" }, { registrationNo: "asc" }],
            take: 1,
          },
        },
      },
    },
  });

  if (rows.length === 0) {
    return null;
  }

  const items: BeagleTrialDetailsRowDb[] = rows
    .map((row) => ({
      id: row.id,
      dogId: row.dog.id,
      registrationNo: row.dog.registrations[0]?.registrationNo ?? "-",
      name: row.dog.name,
      sex: toSexCode(row.dog.sex),
      // Legacy akoeall result columns shown/copied to users.
      weather: row.ke,
      award: row.pa,
      classCode: row.lk,
      rank: row.sija,
      points: row.piste ? row.piste.toNumber() : null,
      judge: row.judge,
      haku: row.haku ? row.haku.toNumber() : null,
      hauk: row.hauk ? row.hauk.toNumber() : null,
      yva: row.yva ? row.yva.toNumber() : null,
      hlo: row.hlo ? row.hlo.toNumber() : null,
      alo: row.alo ? row.alo.toNumber() : null,
      tja: row.tja ? row.tja.toNumber() : null,
      pin: row.pin ? row.pin.toNumber() : null,
      legacyFlag: row.legacyFlag,
      sourceKey: row.sourceKey,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
    .sort(compareDetailRows);

  const judges = Array.from(
    new Set(
      rows
        .map((row) => row.judge?.trim())
        .filter((judge): judge is string => Boolean(judge)),
    ),
  );

  return {
    eventDate: rows[0].eventDate,
    eventPlace: rows[0].eventPlace,
    judge: judges.length === 1 ? judges[0] : null,
    dogCount: items.length,
    items,
  };
}
