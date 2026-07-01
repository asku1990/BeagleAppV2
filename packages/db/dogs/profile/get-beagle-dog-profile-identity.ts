// Loads only the dog identity needed by lightweight dog-centric views.
import { prisma } from "@db/core/prisma";
import { getPrimaryRegistrationNo } from "./internal/profile-mappers";

export type BeagleDogProfileIdentityDb = {
  id: string;
  name: string;
  registrationNo: string;
};

export async function getBeagleDogProfileIdentityDb(
  dogId: string,
): Promise<BeagleDogProfileIdentityDb | null> {
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
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!dog) {
    return null;
  }

  return {
    id: dog.id,
    name: dog.name,
    registrationNo: getPrimaryRegistrationNo(dog.registrations),
  };
}
