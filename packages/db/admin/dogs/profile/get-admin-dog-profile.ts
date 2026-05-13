import { prisma } from "@db/core/prisma";
import { getDogProfileBaseRow } from "@db/dogs/profile/internal/profile-base-query";
import type { DogProfileBaseRow } from "@db/dogs/profile/internal/profile-base-query";

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
  base: DogProfileBaseRow;
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
  const [base, adminDog] = await Promise.all([
    getDogProfileBaseRow(dogId),
    prisma.dog.findUnique({
      where: { id: dogId },
      select: {
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
    }),
  ]);

  if (!base || !adminDog) {
    return null;
  }

  return {
    base,
    note: adminDog.note,
    breeder: adminDog.breeder
      ? {
          name: adminDog.breeder.name,
          ownerName: adminDog.breeder.ownerName,
          city: adminDog.breeder.city,
          detailsSource: adminDog.breeder.detailsSource,
        }
      : null,
    owners: adminDog.ownerships
      .map((ownership) => ({
        name: ownership.owner.name,
        postalCode: ownership.owner.postalCode,
        city: ownership.owner.city,
      }))
      .filter((owner) => owner.name.trim().length > 0),
    diseases: adminDog.sairaudet.map((row) => ({
      id: row.id,
      diseaseText: row.sairaus.sairausTeksti,
      diseaseGroup: mapDiseaseGroup(row.sairaus.sairausRyhma),
      public: row.julkinen,
      source: row.tietolahde,
    })),
  };
}
