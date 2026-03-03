import { DogSex, type Prisma } from "@prisma/client";
import { getWildcardProbe, hasWildcard } from "./wildcard";

function toYearStartDateUtc(year: number): Date {
  return new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
}

function toYearEndDateUtc(year: number): Date {
  return new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
}

export function buildWhere(input: {
  ek: string;
  reg: string;
  name: string;
  sex?: "male" | "female";
  birthYearFrom?: number;
  birthYearTo?: number;
  ekOnly?: boolean;
}): Prisma.DogWhereInput {
  const and: Prisma.DogWhereInput[] = [];

  if (input.ek) {
    if (!hasWildcard(input.ek)) {
      const parsedEk = Number.parseInt(input.ek, 10);
      if (Number.isFinite(parsedEk) && String(parsedEk) === input.ek) {
        and.push({ ekNo: parsedEk });
      } else {
        and.push({ id: "__no_match__" });
      }
    }
  }

  if (input.reg) {
    if (hasWildcard(input.reg)) {
      const probe = getWildcardProbe(input.reg);
      if (probe) {
        and.push({
          registrations: {
            some: {
              registrationNo: {
                contains: probe,
                mode: "insensitive",
              },
            },
          },
        });
      }
    } else {
      and.push({
        registrations: {
          some: {
            registrationNo: {
              startsWith: input.reg,
              mode: "insensitive",
            },
          },
        },
      });
    }
  }

  if (input.name) {
    if (!hasWildcard(input.name)) {
      and.push({
        name: {
          contains: input.name,
          mode: "insensitive",
        },
      });
    } else {
      const probe = getWildcardProbe(input.name);
      if (probe) {
        and.push({
          name: {
            contains: probe,
            mode: "insensitive",
          },
        });
      }
    }
  }

  if (input.sex === "male") {
    and.push({ sex: DogSex.MALE });
  } else if (input.sex === "female") {
    and.push({ sex: DogSex.FEMALE });
  }

  if (input.birthYearFrom != null) {
    and.push({
      birthDate: {
        gte: toYearStartDateUtc(input.birthYearFrom),
      },
    });
  }

  if (input.birthYearTo != null) {
    and.push({
      birthDate: {
        lte: toYearEndDateUtc(input.birthYearTo),
      },
    });
  }

  if (input.ekOnly === true) {
    and.push({
      ekNo: {
        not: null,
      },
    });
  }

  if (and.length === 0) return {};
  return { AND: and };
}
