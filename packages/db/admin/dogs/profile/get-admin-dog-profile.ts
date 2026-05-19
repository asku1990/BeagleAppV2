import { prisma } from "@db/core/prisma";
import type {
  OffspringDogNode,
  ParentDogNode,
  RegistrationNode,
} from "@db/dogs/profile/internal/profile-types";
import { DogSex } from "@prisma/client";

type AdminDogProfileDiseaseDb = {
  id: string;
  diseaseText: string;
  diseaseGroup: "EPILEPSIA" | "LAFORA" | "PURENTA" | "MLS" | "MUU";
  public: boolean;
  source: string | null;
};

type AdminDogProfileOwnerDb = {
  name: string;
  postalCode: string;
  city: string;
};

type AdminDogProfileBreederDb = {
  name: string;
  ownerName: string | null;
  city: string | null;
  detailsSource: string | null;
};

export type AdminDogProfileDb = {
  base: {
    id: string;
    name: string;
    registrationNos: RegistrationNode[];
    birthDate: Date | null;
    sex: DogSex;
    color: string | null;
    ekNo: number | null;
    inbreedingCoefficientPct: number | null;
    sire: ParentDogNode | null;
    dam: ParentDogNode | null;
    whelpedPuppies: OffspringDogNode[];
    siredPuppies: OffspringDogNode[];
    breederNameText: string | null;
  };
  note: string | null;
  breeder: AdminDogProfileBreederDb | null;
  owners: AdminDogProfileOwnerDb[];
  diseases: AdminDogProfileDiseaseDb[];
};

function mapDiseaseGroup(
  group: string,
): AdminDogProfileDiseaseDb["diseaseGroup"] {
  if (
    group === "EPILEPSIA" ||
    group === "LAFORA" ||
    group === "PURENTA" ||
    group === "MLS"
  ) {
    return group;
  }

  return "MUU";
}

export async function getAdminDogProfileDb(
  dogId: string,
): Promise<AdminDogProfileDb | null> {
  const dog = await prisma.dog.findUnique({
    where: { id: dogId },
    select: {
      id: true,
      name: true,
      registrations: {
        select: {
          registrationNo: true,
          createdAt: true,
        },
      },
      birthDate: true,
      sex: true,
      ekNo: true,
      siitosasteProsentti: true,
      sire: {
        select: {
          id: true,
          name: true,
          ekNo: true,
          registrations: {
            select: {
              registrationNo: true,
              createdAt: true,
            },
          },
        },
      },
      dam: {
        select: {
          id: true,
          name: true,
          ekNo: true,
          registrations: {
            select: {
              registrationNo: true,
              createdAt: true,
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
              trialEntries: true,
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
              trialEntries: true,
            },
          },
        },
      },
      breederNameText: true,
      note: true,
      breeder: {
        select: {
          name: true,
          ownerName: true,
          city: true,
          detailsSource: true,
        },
      },
      ownerships: {
        select: {
          owner: {
            select: {
              name: true,
              postalCode: true,
              city: true,
            },
          },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
      sairaudet: {
        select: {
          id: true,
          julkinen: true,
          tietolahde: true,
          sairaus: {
            select: {
              sairausTeksti: true,
              sairausRyhma: true,
            },
          },
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!dog) {
    return null;
  }

  return {
    base: {
      id: dog.id,
      name: dog.name,
      registrationNos: dog.registrations,
      birthDate: dog.birthDate,
      sex: dog.sex,
      color: null,
      ekNo: dog.ekNo,
      inbreedingCoefficientPct:
        dog.siitosasteProsentti == null ? null : Number(dog.siitosasteProsentti),
      sire: dog.sire
        ? {
            id: dog.sire.id,
            name: dog.sire.name,
            ekNo: dog.sire.ekNo,
            registrations: dog.sire.registrations,
          }
        : null,
      dam: dog.dam
        ? {
            id: dog.dam.id,
            name: dog.dam.name,
            ekNo: dog.dam.ekNo,
            registrations: dog.dam.registrations,
          }
        : null,
      whelpedPuppies: dog.whelpedPuppies,
      siredPuppies: dog.siredPuppies,
      breederNameText: dog.breederNameText,
    },
    note: dog.note,
    breeder: dog.breeder
      ? {
          name: dog.breeder.name,
          ownerName: dog.breeder.ownerName,
          city: dog.breeder.city,
          detailsSource: dog.breeder.detailsSource,
        }
      : null,
    owners: dog.ownerships
      .map((ownership) => ({
        name: ownership.owner.name,
        postalCode: ownership.owner.postalCode,
        city: ownership.owner.city,
      }))
      .filter((owner) => owner.name.trim().length > 0),
    diseases: dog.sairaudet.map((row) => ({
      id: row.id,
      diseaseText: row.sairaus.sairausTeksti,
      diseaseGroup: mapDiseaseGroup(row.sairaus.sairausRyhma),
      public: row.julkinen,
      source: row.tietolahde,
    })),
  };
}
