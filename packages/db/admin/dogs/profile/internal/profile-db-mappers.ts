import type { Prisma } from "@prisma/client";
import type { AdminDogProfileDb } from "../types";
import { adminDogProfileSelect } from "./profile-select";

type AdminDogProfileDiseaseGroup = AdminDogProfileDb["diseases"][number]["diseaseGroup"];

type AdminDogProfileRow = Prisma.DogGetPayload<{
  select: typeof adminDogProfileSelect;
}>;

function mapDiseaseGroup(group: string): AdminDogProfileDiseaseGroup {
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

export function mapAdminDogProfileDbRow(dog: AdminDogProfileRow): AdminDogProfileDb {
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
