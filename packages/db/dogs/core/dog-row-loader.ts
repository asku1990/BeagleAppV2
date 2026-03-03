import { DogSex, type Prisma } from "@prisma/client";
import { prisma } from "../../core/prisma";
import {
  getFirstInsertedRegistrationNo,
  sortRegistrationsByInsertedAsc,
} from "./registration";

export type RawDogRow = {
  id: string;
  ekNo: number | null;
  createdAt: Date;
  name: string;
  sex: DogSex;
  birthDate: Date | null;
  registrationNos: string[];
  primaryRegistrationNo: string;
  sire: string;
  dam: string;
  trialCount: number;
  showCount: number;
};

export type LoadDogsInput = {
  where: Prisma.DogWhereInput;
  skip?: number;
  take?: number;
  orderBy?:
    | Prisma.DogOrderByWithRelationInput
    | Prisma.DogOrderByWithRelationInput[];
};

function formatParent(
  parent: {
    name: string;
    registrationNo: string | null;
  } | null,
): string {
  if (!parent) return "-";

  const reg = parent.registrationNo?.trim() ?? "";
  const name = parent.name.trim();

  if (reg && name) return `${reg} ${name}`;
  if (name) return name;
  if (reg) return reg;
  return "-";
}

export async function loadDogs(input: LoadDogsInput): Promise<RawDogRow[]> {
  const dogs = await prisma.dog.findMany({
    where: input.where,
    skip: input.skip,
    take: input.take,
    orderBy: input.orderBy,
    select: {
      id: true,
      ekNo: true,
      createdAt: true,
      name: true,
      sex: true,
      birthDate: true,
      registrations: {
        select: {
          registrationNo: true,
          createdAt: true,
        },
      },
      sire: {
        select: {
          name: true,
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
          name: true,
          registrations: {
            select: {
              registrationNo: true,
              createdAt: true,
            },
          },
        },
      },
      _count: {
        select: {
          trialResults: true,
          showResults: true,
        },
      },
    },
  });

  return dogs.map((dog) => {
    const sortedRegistrations = sortRegistrationsByInsertedAsc(
      dog.registrations,
    );
    const registrationNos = sortedRegistrations.map(
      (registration) => registration.registrationNo,
    );
    const primaryRegistrationNo = sortedRegistrations[0]?.registrationNo ?? "-";

    return {
      id: dog.id,
      ekNo: dog.ekNo,
      createdAt: dog.createdAt,
      name: dog.name,
      sex: dog.sex,
      birthDate: dog.birthDate,
      registrationNos,
      primaryRegistrationNo,
      sire: formatParent({
        name: dog.sire?.name ?? "",
        registrationNo: dog.sire
          ? getFirstInsertedRegistrationNo(dog.sire.registrations)
          : null,
      }),
      dam: formatParent({
        name: dog.dam?.name ?? "",
        registrationNo: dog.dam
          ? getFirstInsertedRegistrationNo(dog.dam.registrations)
          : null,
      }),
      trialCount: dog._count.trialResults,
      showCount: dog._count.showResults,
    };
  });
}
