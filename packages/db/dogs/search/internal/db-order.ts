import type { Prisma } from "@prisma/client";
import type { BeagleSearchSortDb } from "../repository";

export function resolveDbOrderBy(
  sort: BeagleSearchSortDb,
): Prisma.DogOrderByWithRelationInput[] | null {
  if (sort === "name-asc") {
    return [{ name: "asc" }, { id: "asc" }];
  }
  if (sort === "birth-desc") {
    return [{ birthDate: { sort: "desc", nulls: "last" } }, { id: "asc" }];
  }
  if (sort === "created-desc") {
    return [{ createdAt: "desc" }, { id: "desc" }];
  }
  if (sort === "ek-asc") {
    return [{ ekNo: { sort: "asc", nulls: "last" } }, { id: "asc" }];
  }
  return null;
}
