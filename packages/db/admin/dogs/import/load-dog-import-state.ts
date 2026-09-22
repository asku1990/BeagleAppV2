import { prisma } from "@db/core/prisma";
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
  const registrations = await prisma.dogRegistration.findMany({
    include: { dog: { include: { breeder: { select: { name: true } } } } },
  });
  const dogs = registrations.flatMap((registration) => {
    const canonical = normalizeRegistrationNo(registration.registrationNo);
    if (!canonical || !wanted.has(canonical)) return [];
    const { dog } = registration;
    return [
      {
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
      },
    ];
  });
  const colors = await prisma.dogColor.findMany({
    select: { code: true, nameFi: true, status: true, updatedAt: true },
  });
  return { dogs, colors };
}
