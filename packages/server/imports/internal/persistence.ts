import {
  prisma,
  type LegacyOwnerRow,
  type LegacyTrialResultRow,
} from "@beagle/db";
import {
  isValidRegistrationNo,
  normalizeNullable,
  normalizeRegistrationNo,
  parseLegacyDate,
} from "../core";
import { toEventSourceDatePart } from "./date-key";

type PrismaUniqueError = {
  code?: string;
};

function isPrismaUniqueError(error: unknown): error is PrismaUniqueError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function upsertOwner(row: LegacyOwnerRow): Promise<string | null> {
  const ownerName = normalizeNullable(row.ownerName);
  if (!ownerName) return null;

  const postalCode = normalizeNullable(row.postalCode) ?? "";
  const city = normalizeNullable(row.city) ?? "";

  const existing = await prisma.owner.findFirst({
    where: { name: ownerName, postalCode, city },
    select: { id: true },
  });
  if (existing) return existing.id;

  try {
    const created = await prisma.owner.create({
      data: { name: ownerName, postalCode, city },
      select: { id: true },
    });
    return created.id;
  } catch (error) {
    // Concurrent import runs can race on the unique owner key.
    if (!isPrismaUniqueError(error)) {
      throw error;
    }

    const createdByRacingRun = await prisma.owner.findFirst({
      where: { name: ownerName, postalCode, city },
      select: { id: true },
    });
    if (!createdByRacingRun) {
      throw error;
    }
    return createdByRacingRun.id;
  }
}

function parseLegacyScore(
  value: string | number | null | undefined,
): number | null {
  if (value == null) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

type EventUpsertResult = {
  upserted: number;
  errors: number;
  issues: Array<{
    code: string;
    message: string;
    registrationNo: string | null;
    sourceTable: string;
    payloadJson: string;
  }>;
};

export async function upsertTrialRows(
  rows: LegacyTrialResultRow[],
  dogIdByRegistration: Map<string, string>,
  options?: {
    onProgress?: (processed: number, total: number) => void;
  },
): Promise<EventUpsertResult> {
  const total = rows.length;
  let upserted = 0;
  let errors = 0;
  let processed = 0;
  const sourceTable = "akoeall";
  const issues: Array<{
    code: string;
    message: string;
    registrationNo: string | null;
    sourceTable: string;
    payloadJson: string;
  }> = [];

  for (const row of rows) {
    processed += 1;
    const registrationNo = normalizeRegistrationNo(row.registrationNo);
    if (registrationNo && !isValidRegistrationNo(registrationNo)) {
      errors += 1;
      issues.push({
        code: "TRIAL_REGISTRATION_INVALID_FORMAT",
        message: "Event row has invalid registration format.",
        registrationNo,
        sourceTable,
        payloadJson: JSON.stringify({
          registrationNo: row.registrationNo,
          eventPlace: row.eventPlace,
          eventDateRaw: row.eventDateRaw,
          pa: row.pa,
          piste: row.piste,
        }),
      });
      if (processed % 1000 === 0) {
        options?.onProgress?.(processed, total);
      }
      continue;
    }

    const dogId = registrationNo
      ? dogIdByRegistration.get(registrationNo)
      : undefined;
    const eventDate = parseLegacyDate(row.eventDateRaw);
    const eventPlace = normalizeNullable(row.eventPlace);
    if (!dogId || !eventDate || !eventPlace) {
      errors += 1;
      issues.push({
        code: "TRIAL_EVENT_MISSING_REQUIRED_FIELDS",
        message: "Trial row missing dog, event date, or event place.",
        registrationNo,
        sourceTable,
        payloadJson: JSON.stringify({
          registrationNo: row.registrationNo,
          eventPlace: row.eventPlace,
          eventDateRaw: row.eventDateRaw,
        }),
      });
      if (processed % 1000 === 0) {
        options?.onProgress?.(processed, total);
      }
      continue;
    }

    const normalizedEventDate = toEventSourceDatePart(eventDate);
    const sourceKey = `${registrationNo}|${normalizedEventDate}|${eventPlace}`;

    await prisma.trialResult.upsert({
      where: { sourceKey },
      create: {
        dogId,
        eventDate,
        eventName: null,
        eventPlace,
        kennelDistrict: normalizeNullable(row.kennelDistrict),
        kennelDistrictNo: normalizeNullable(row.kennelDistrictNo),
        ke: normalizeNullable(row.ke),
        lk: normalizeNullable(row.lk),
        pa: normalizeNullable(row.pa),
        piste: parseLegacyScore(row.piste),
        sija: normalizeNullable(row.sija),
        haku: parseLegacyScore(row.haku),
        hauk: parseLegacyScore(row.hauk),
        yva: parseLegacyScore(row.yva),
        hlo: parseLegacyScore(row.hlo),
        alo: parseLegacyScore(row.alo),
        tja: parseLegacyScore(row.tja),
        pin: parseLegacyScore(row.pin),
        judge: normalizeNullable(row.judge),
        legacyFlag: normalizeNullable(row.legacyFlag),
        sourceKey,
      },
      update: {
        dogId,
        eventDate,
        eventName: null,
        eventPlace,
        kennelDistrict: normalizeNullable(row.kennelDistrict),
        kennelDistrictNo: normalizeNullable(row.kennelDistrictNo),
        ke: normalizeNullable(row.ke),
        lk: normalizeNullable(row.lk),
        pa: normalizeNullable(row.pa),
        piste: parseLegacyScore(row.piste),
        sija: normalizeNullable(row.sija),
        haku: parseLegacyScore(row.haku),
        hauk: parseLegacyScore(row.hauk),
        yva: parseLegacyScore(row.yva),
        hlo: parseLegacyScore(row.hlo),
        alo: parseLegacyScore(row.alo),
        tja: parseLegacyScore(row.tja),
        pin: parseLegacyScore(row.pin),
        judge: normalizeNullable(row.judge),
        legacyFlag: normalizeNullable(row.legacyFlag),
      },
    });

    upserted += 1;
    if (processed % 1000 === 0) {
      options?.onProgress?.(processed, total);
    }
  }

  options?.onProgress?.(processed, total);
  return { upserted, errors, issues };
}
