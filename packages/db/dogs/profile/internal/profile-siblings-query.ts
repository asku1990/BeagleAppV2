// Encapsulates sibling candidate query shape so the profile DB use-case remains
// focused on orchestration instead of Prisma include/where details.
import { prisma } from "../../../core/prisma";
import {
  buildSiblingWhere,
  type SiblingProfileContext,
} from "./profile-siblings";

const siblingCandidateInclude = {
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
} as const;

export async function getSiblingCandidates(context: SiblingProfileContext) {
  return prisma.dog.findMany({
    where: buildSiblingWhere(context),
    include: siblingCandidateInclude,
  });
}
