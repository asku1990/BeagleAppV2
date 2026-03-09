// Loads the base dog profile record from Prisma and assembles
// pedigree plus grouped offspring data for service-level mapping.
import { prisma } from "../../core/prisma";
import {
  buildLitters,
  buildOffspringSummary,
} from "./internal/offspring-litters";
import {
  buildSiblings,
  buildSiblingsSummary,
  createSiblingProfileContext,
} from "./internal/profile-siblings";
import { getSiblingCandidates } from "./internal/profile-siblings-query";
import {
  createPedigreeCard,
  getPrimaryRegistrationNo,
  mapParent,
  toSexCode,
} from "./internal/profile-mappers";
import type {
  BeagleDogProfileDb,
  BeagleDogProfilePedigreeGenerationDb,
  PedigreeDogNode,
} from "./internal/profile-types";
export type {
  BeagleDogProfileDb,
  BeagleDogProfileLitterDb,
  BeagleDogProfileOffspringRowDb,
  BeagleDogProfileOffspringSummaryDb,
  BeagleDogProfileParentDb,
  BeagleDogProfilePedigreeCardDb,
  BeagleDogProfilePedigreeGenerationDb,
  BeagleDogProfileSiblingRowDb,
  BeagleDogProfileSiblingsSummaryDb,
  BeagleDogProfileSexDb,
} from "./internal/profile-types";

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
      whelpedPuppies: {
        include: {
          registrations: true,
          sire: { include: { registrations: true } },
          dam: { include: { registrations: true } },
          whelpedPuppies: {
            select: {
              id: true,
              birthDate: true,
              sire: {
                select: {
                  id: true,
                  registrations: true,
                },
              },
              dam: {
                select: {
                  id: true,
                  registrations: true,
                },
              },
            },
          },
          siredPuppies: {
            select: {
              id: true,
              birthDate: true,
              sire: {
                select: {
                  id: true,
                  registrations: true,
                },
              },
              dam: {
                select: {
                  id: true,
                  registrations: true,
                },
              },
            },
          },
          _count: {
            select: {
              showResults: true,
              trialResults: true,
            },
          },
        },
      },
      siredPuppies: {
        include: {
          registrations: true,
          sire: { include: { registrations: true } },
          dam: { include: { registrations: true } },
          whelpedPuppies: {
            select: {
              id: true,
              birthDate: true,
              sire: {
                select: {
                  id: true,
                  registrations: true,
                },
              },
              dam: {
                select: {
                  id: true,
                  registrations: true,
                },
              },
            },
          },
          siredPuppies: {
            select: {
              id: true,
              birthDate: true,
              sire: {
                select: {
                  id: true,
                  registrations: true,
                },
              },
              dam: {
                select: {
                  id: true,
                  registrations: true,
                },
              },
            },
          },
          _count: {
            select: {
              showResults: true,
              trialResults: true,
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

  const sex = toSexCode(dog.sex);
  const litters = buildLitters(
    dog.id,
    sex,
    dog.whelpedPuppies,
    dog.siredPuppies,
  );
  const siblingContext = createSiblingProfileContext({
    id: dog.id,
    birthDate: dog.birthDate,
    sire: dog.sire,
    dam: dog.dam,
  });
  const siblingCandidates = siblingContext
    ? await getSiblingCandidates(siblingContext)
    : [];
  const siblings = buildSiblings(siblingCandidates);

  return {
    id: dog.id,
    name: dog.name,
    title: null,
    registrationNo: getPrimaryRegistrationNo(dog.registrations),
    registrationNos: dog.registrations.map(
      (registration) => registration.registrationNo,
    ),
    birthDate: dog.birthDate,
    sex,
    color: null,
    ekNo: dog.ekNo,
    inbreedingCoefficientPct: null,
    sire: mapParent(dog.sire),
    dam: mapParent(dog.dam),
    pedigree,
    offspringSummary: buildOffspringSummary(litters),
    litters,
    siblingsSummary: buildSiblingsSummary(siblings),
    siblings,
  };
}
