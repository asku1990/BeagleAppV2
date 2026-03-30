// Fetches the base dog profile row shape (dog + pedigree + offspring relations)
// used by the profile DB orchestrator.
import { prisma } from "../../../core/prisma";

export async function getDogProfileBaseRow(dogId: string) {
  return prisma.dog.findUnique({
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
              showEntries: true,
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
              showEntries: true,
              trialResults: true,
            },
          },
        },
      },
    },
  });
}

export type DogProfileBaseRow = NonNullable<
  Awaited<ReturnType<typeof getDogProfileBaseRow>>
>;
