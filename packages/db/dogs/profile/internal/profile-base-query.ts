// Fetches the base dog profile row shape (dog + pedigree + offspring relations)
// used by the profile DB orchestrator.
import { prisma } from "@db/core/prisma";
import { DogStatus } from "@prisma/client";

export async function getDogProfileBaseRow(dogId: string) {
  return prisma.dog.findFirst({
    where: { id: dogId, status: DogStatus.NORMAL },
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
        where: { status: DogStatus.NORMAL },
        include: {
          color: true,
          registrations: true,
          sire: { include: { registrations: true } },
          dam: { include: { registrations: true } },
          whelpedPuppies: {
            where: { status: DogStatus.NORMAL },
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
            where: { status: DogStatus.NORMAL },
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
              trialEntries: true,
            },
          },
        },
      },
      siredPuppies: {
        where: { status: DogStatus.NORMAL },
        include: {
          color: true,
          registrations: true,
          sire: { include: { registrations: true } },
          dam: { include: { registrations: true } },
          whelpedPuppies: {
            where: { status: DogStatus.NORMAL },
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
            where: { status: DogStatus.NORMAL },
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
              trialEntries: true,
            },
          },
        },
      },
      titles: {
        select: {
          awardedOn: true,
          titleCode: true,
          titleName: true,
          sortOrder: true,
          createdAt: true,
          id: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      },
      color: {
        select: {
          code: true,
          nameFi: true,
          nameSv: true,
          nameEn: true,
          status: true,
        },
      },
    },
  });
}

export type DogProfileBaseRow = NonNullable<
  Awaited<ReturnType<typeof getDogProfileBaseRow>>
>;
