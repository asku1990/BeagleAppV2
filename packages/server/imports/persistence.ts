import { prisma, type LegacyEventRow, type LegacyOwnerRow } from "@beagle/db";
import {
  isValidRegistrationNo,
  normalizeNullable,
  normalizeRegistrationNo,
  parseLegacyDate,
} from "./transform";

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

  const postalCode = normalizeNullable(row.postalCode);
  const city = normalizeNullable(row.city);

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

export async function upsertEventRows(
  rows: LegacyEventRow[],
  type: "trial" | "show",
  dogIdByRegistration: Map<string, string>,
  options?: {
    onProgress?: (processed: number, total: number) => void;
  },
): Promise<{
  upserted: number;
  errors: number;
  issues: Array<{
    code: string;
    message: string;
    registrationNo: string | null;
    sourceTable: "akoeall" | "nay9599";
    payloadJson: string;
  }>;
}> {
  const total = rows.length;
  let upserted = 0;
  let errors = 0;
  let processed = 0;
  const sourceTable = type === "trial" ? "akoeall" : "nay9599";
  const issues: Array<{
    code: string;
    message: string;
    registrationNo: string | null;
    sourceTable: "akoeall" | "nay9599";
    payloadJson: string;
  }> = [];

  for (const row of rows) {
    processed += 1;
    const registrationNo = normalizeRegistrationNo(row.registrationNo);
    if (registrationNo && !isValidRegistrationNo(registrationNo)) {
      errors += 1;
      issues.push({
        code: "REGISTRATION_INVALID_FORMAT",
        message: "Event row has invalid registration format.",
        registrationNo,
        sourceTable,
        payloadJson: JSON.stringify({
          registrationNo: row.registrationNo,
          eventName: row.eventName,
          eventDateRaw: row.eventDateRaw,
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
    const eventName = normalizeNullable(row.eventName);
    if (!dogId || !eventDate || !eventName) {
      errors += 1;
      issues.push({
        code: "EVENT_MISSING_REQUIRED_FIELDS",
        message: "Event row missing dog, event date, or event name.",
        registrationNo,
        sourceTable,
        payloadJson: JSON.stringify({
          registrationNo: row.registrationNo,
          eventName: row.eventName,
          eventDateRaw: row.eventDateRaw,
        }),
      });
      if (processed % 1000 === 0) {
        options?.onProgress?.(processed, total);
      }
      continue;
    }

    const sourceKey = `${registrationNo}|${row.eventDateRaw}|${eventName}`;

    if (type === "trial") {
      await prisma.trialResult.upsert({
        where: { sourceKey },
        create: { dogId, eventDate, eventName, sourceKey },
        update: { dogId, eventDate, eventName },
      });
    } else {
      await prisma.showResult.upsert({
        where: { sourceKey },
        create: { dogId, eventDate, eventName, sourceKey },
        update: { dogId, eventDate, eventName },
      });
    }

    upserted += 1;
    if (processed % 1000 === 0) {
      options?.onProgress?.(processed, total);
    }
  }

  options?.onProgress?.(processed, total);
  return { upserted, errors, issues };
}
