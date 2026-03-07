import { DogSex } from "@prisma/client";
import { prisma } from "../../core/prisma";
import { getFirstInsertedRegistrationNo } from "../core/registration";

export type BeagleDogProfileSexDb = "U" | "N" | "-";

export type BeagleDogProfileParentDb = {
  id: string;
  name: string;
  registrationNo: string | null;
  ekNo: number | null;
};

export type BeagleDogProfilePedigreeCardDb = {
  id: string;
  sire: BeagleDogProfileParentDb | null;
  dam: BeagleDogProfileParentDb | null;
};

export type BeagleDogProfilePedigreeGenerationDb = {
  generation: number;
  cards: BeagleDogProfilePedigreeCardDb[];
};

export type BeagleDogProfileDb = {
  id: string;
  name: string;
  title: string | null;
  registrationNo: string;
  registrationNos: string[];
  birthDate: Date | null;
  sex: BeagleDogProfileSexDb;
  color: string | null;
  ekNo: number | null;
  inbreedingCoefficientPct: number | null;
  sire: BeagleDogProfileParentDb | null;
  dam: BeagleDogProfileParentDb | null;
  pedigree: BeagleDogProfilePedigreeGenerationDb[];
};

type PedigreeDogNode = {
  id: string;
  name: string;
  ekNo?: number | null;
  registrations: { registrationNo: string; createdAt: Date }[];
  sire?: PedigreeDogNode | null;
  dam?: PedigreeDogNode | null;
};

function toSexCode(value: DogSex): BeagleDogProfileSexDb {
  if (value === DogSex.MALE) return "U";
  if (value === DogSex.FEMALE) return "N";
  return "-";
}

function getPrimaryRegistrationNo(
  registrations: { registrationNo: string; createdAt: Date }[],
): string {
  if (registrations.length === 0) return "-";
  return getFirstInsertedRegistrationNo(registrations) ?? "-";
}

function mapParent(
  dog: {
    id: string;
    name: string;
    ekNo?: number | null;
    registrations: { registrationNo: string; createdAt: Date }[];
  } | null,
): BeagleDogProfileParentDb | null {
  if (!dog) return null;
  const registrationNo =
    dog.registrations.length > 0
      ? getPrimaryRegistrationNo(dog.registrations)
      : null;
  return {
    id: dog.id,
    name: dog.name,
    registrationNo,
    ekNo: dog.ekNo ?? null,
  };
}

function createPedigreeCard(
  dogId: string,
  generation: number,
  index: number,
  parent: PedigreeDogNode | null | undefined,
): BeagleDogProfilePedigreeCardDb {
  return {
    id: `${dogId}-g${String(generation)}-c${String(index + 1)}`,
    sire: mapParent(parent?.sire ?? null),
    dam: mapParent(parent?.dam ?? null),
  };
}

export async function getBeagleDogProfileDb(
  dogId: string,
): Promise<BeagleDogProfileDb | null> {
  const dog = await prisma.dog.findUnique({
    where: { id: dogId },
    include: {
      registrations: true,
      sire: {
        include: {
          registrations: true,
          sire: {
            include: {
              registrations: true,
              sire: { include: { registrations: true } },
              dam: { include: { registrations: true } },
            },
          },
          dam: {
            include: {
              registrations: true,
              sire: { include: { registrations: true } },
              dam: { include: { registrations: true } },
            },
          },
        },
      },
      dam: {
        include: {
          registrations: true,
          sire: {
            include: {
              registrations: true,
              sire: { include: { registrations: true } },
              dam: { include: { registrations: true } },
            },
          },
          dam: {
            include: {
              registrations: true,
              sire: { include: { registrations: true } },
              dam: { include: { registrations: true } },
            },
          },
        },
      },
    },
  });

  if (!dog) {
    return null;
  }

  const pedigree: BeagleDogProfilePedigreeGenerationDb[] = [];

  pedigree.push({
    generation: 1,
    cards: [
      {
        id: `${dog.id}-g1-c1`,
        sire: mapParent(dog.sire),
        dam: mapParent(dog.dam),
      },
    ],
  });

  const g2Parents: Array<PedigreeDogNode | null | undefined> = [
    dog.sire,
    dog.dam,
  ];
  const g2Cards = g2Parents.map((parent, index) =>
    createPedigreeCard(dog.id, 2, index, parent),
  );
  pedigree.push({ generation: 2, cards: g2Cards });

  const g3Parents: Array<PedigreeDogNode | null | undefined> = [
    dog.sire?.sire,
    dog.sire?.dam,
    dog.dam?.sire,
    dog.dam?.dam,
  ];
  const g3Cards = g3Parents.map((parent, index) =>
    createPedigreeCard(dog.id, 3, index, parent),
  );
  pedigree.push({ generation: 3, cards: g3Cards });

  return {
    id: dog.id,
    name: dog.name,
    title: null,
    registrationNo: getPrimaryRegistrationNo(dog.registrations),
    registrationNos: dog.registrations.map(
      (registration) => registration.registrationNo,
    ),
    birthDate: dog.birthDate,
    sex: toSexCode(dog.sex),
    color: null,
    ekNo: dog.ekNo,
    inbreedingCoefficientPct: null,
    sire: mapParent(dog.sire),
    dam: mapParent(dog.dam),
    pedigree,
  };
}
