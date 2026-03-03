import type { Prisma } from "@prisma/client";
import { prisma } from "../../../core/prisma";
import { sortRegistrationsDesc } from "../../core/registration";
import type { RegistrationOrderKeyRow } from "./types";

export async function loadRegistrationOrderKeys(
  where: Prisma.DogWhereInput,
): Promise<RegistrationOrderKeyRow[]> {
  const dogs = await prisma.dog.findMany({
    where,
    select: {
      id: true,
      registrations: {
        select: {
          registrationNo: true,
          createdAt: true,
        },
      },
    },
  });

  return dogs.map((dog) => {
    const sortedRegistrations = sortRegistrationsDesc(dog.registrations);
    return {
      id: dog.id,
      primaryRegistrationNo: sortedRegistrations[0]?.registrationNo ?? "-",
    };
  });
}

export async function loadDogIdsWithMultipleRegistrations(
  where: Prisma.DogWhereInput,
): Promise<string[]> {
  const rows = await prisma.dogRegistration.groupBy({
    by: ["dogId"],
    where: {
      dog: where,
    },
    _count: {
      _all: true,
    },
  });

  return rows.filter((row) => row._count._all > 1).map((row) => row.dogId);
}
