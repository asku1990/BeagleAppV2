import type { BeagleSearchRowDb } from "../search/repository";
import { DogStatus } from "@prisma/client";
import { loadDogs } from "../core/dog-row-loader";
import { toSearchRow } from "../core/search-row-mapper";
import { parseNewestLimit } from "./internal/limit";

export async function getNewestBeagleDogsDb(
  limitInput?: number,
): Promise<BeagleSearchRowDb[]> {
  const limit = parseNewestLimit(limitInput);
  const rows = await loadDogs({
    where: { status: DogStatus.NORMAL },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
  });

  return rows.map(toSearchRow);
}
