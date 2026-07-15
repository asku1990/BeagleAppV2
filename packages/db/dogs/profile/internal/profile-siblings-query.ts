// Encapsulates sibling candidate query shape so the profile DB use-case remains
// focused on orchestration instead of Prisma include/where details.
import { prisma } from "@db/core/prisma";
import { DogStatus } from "@prisma/client";
import {
  buildSiblingWhere,
  type SiblingProfileContext,
} from "./profile-siblings";

const siblingCandidateInclude = {
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
} as const;

export async function getSiblingCandidates(context: SiblingProfileContext) {
  return prisma.dog.findMany({
    where: buildSiblingWhere(context),
    include: siblingCandidateInclude,
  });
}
