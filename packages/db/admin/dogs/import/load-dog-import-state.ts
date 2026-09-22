import { prisma } from "@db/core/prisma";
import { Prisma } from "@prisma/client";
import type { DogImportStateDb } from "./types";

const normalizeRegistrationNo = (value: string) =>
  value.trim().toLocaleUpperCase("fi-FI");

export async function loadDogImportStateDb(
  registrationNos: readonly string[],
): Promise<DogImportStateDb> {
  const wanted = new Set(
    registrationNos
      .map((value) => normalizeRegistrationNo(value))
      .filter(Boolean),
  );
  const registrationIds = new Set<string>();
  const wantedValues = [...wanted];
  // Match legacy noncanonical spellings without scanning every registration.
  for (let offset = 0; offset < wantedValues.length; offset += 500) {
    const batch = wantedValues.slice(offset, offset + 500);
    const matches = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id" FROM "DogRegistration"
      WHERE upper(btrim("registrationNo")) = ANY(${batch}::text[])
    `);
    for (const match of matches) registrationIds.add(match.id);
  }
  const registrations = await prisma.dogRegistration.findMany({
    where: { id: { in: [...registrationIds] } },
    include: {
      dog: {
        include: {
          breeder: { select: { name: true } },
          sire: {
            include: {
              registrations: true,
              breeder: { select: { name: true } },
            },
          },
          dam: {
            include: {
              registrations: true,
              breeder: { select: { name: true } },
            },
          },
        },
      },
    },
  });
  type StateRegistration = Pick<
    (typeof registrations)[number],
    "id" | "registrationNo" | "registeredOn" | "updatedAt"
  > & {
    dog: Pick<
      (typeof registrations)[number]["dog"],
      | "id"
      | "name"
      | "sex"
      | "status"
      | "birthDate"
      | "sireId"
      | "damId"
      | "breederNameText"
      | "breederId"
      | "colorCode"
      | "originTypeText"
      | "originCountryText"
      | "tailText"
      | "updatedAt"
    > & { breeder: { name: string } | null };
  };
  const toStateDog = (registration: StateRegistration) => {
    const canonical = normalizeRegistrationNo(registration.registrationNo);
    if (!canonical) return null;
    const { dog } = registration;
    return {
      id: dog.id,
      registrationNo: canonical,
      name: dog.name,
      sex: dog.sex,
      status: dog.status,
      birthDate: dog.birthDate,
      sireId: dog.sireId,
      damId: dog.damId,
      breederNameText: dog.breederNameText,
      breederId: dog.breederId,
      breederName: dog.breeder?.name ?? null,
      colorCode: dog.colorCode,
      originTypeText: dog.originTypeText,
      originCountryText: dog.originCountryText,
      tailText: dog.tailText,
      updatedAt: dog.updatedAt,
      registrationId: registration.id,
      registeredOn: registration.registeredOn,
      registrationUpdatedAt: registration.updatedAt,
    };
  };
  const dogs = registrations.flatMap((registration) => {
    const dog = toStateDog(registration);
    return dog ? [dog] : [];
  });
  const byRegistrationId = new Map(
    dogs.map((dog) => [dog.registrationId, dog]),
  );
  for (const { dog } of registrations)
    for (const parent of [dog.sire, dog.dam])
      for (const registration of parent?.registrations ?? []) {
        const stateDog = toStateDog({
          ...registration,
          dog: parent as NonNullable<typeof parent>,
        });
        if (stateDog && !byRegistrationId.has(stateDog.registrationId))
          byRegistrationId.set(stateDog.registrationId, stateDog);
      }
  const colors = await prisma.dogColor.findMany({
    select: { code: true, nameFi: true, status: true, updatedAt: true },
  });
  const historicalLinksByRegistration: DogImportStateDb["historicalLinksByRegistration"] =
    {};
  for (let offset = 0; offset < wantedValues.length; offset += 500) {
    const batch = wantedValues.slice(offset, offset + 500);
    const [showEntries, trialEntries] = await Promise.all([
      prisma.$queryRaw<
        Array<{ id: string; registrationNo: string }>
      >(Prisma.sql`
        SELECT "id", "registrationNoSnapshot" AS "registrationNo"
        FROM "ShowEntry"
        WHERE "dogId" IS NULL
          AND upper(btrim("registrationNoSnapshot")) = ANY(${batch}::text[])
      `),
      prisma.$queryRaw<
        Array<{ id: string; registrationNo: string }>
      >(Prisma.sql`
        SELECT "id", "rekisterinumeroSnapshot" AS "registrationNo"
        FROM "TrialEntry"
        WHERE "dogId" IS NULL
          AND upper(btrim("rekisterinumeroSnapshot")) = ANY(${batch}::text[])
      `),
    ]);
    for (const entry of showEntries) {
      const registrationNo = normalizeRegistrationNo(entry.registrationNo);
      const links = historicalLinksByRegistration[registrationNo] ?? {
        showEntryIds: [],
        trialEntryIds: [],
      };
      links.showEntryIds.push(entry.id);
      historicalLinksByRegistration[registrationNo] = links;
    }
    for (const entry of trialEntries) {
      const registrationNo = normalizeRegistrationNo(entry.registrationNo);
      const links = historicalLinksByRegistration[registrationNo] ?? {
        showEntryIds: [],
        trialEntryIds: [],
      };
      links.trialEntryIds.push(entry.id);
      historicalLinksByRegistration[registrationNo] = links;
    }
  }
  return {
    dogs: [...byRegistrationId.values()],
    colors,
    historicalLinksByRegistration,
  };
}
