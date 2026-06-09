import { prisma } from "@db/core/prisma";
import { buildDiseaseBrowseWhere } from "./internal/browse-filter";
import {
  mapDiseaseGroupOptions,
  mapDiseaseOptions,
} from "./internal/browse-options";
import {
  diseaseBrowseRowSelect,
  loadLitterParentPreviews,
  mapDiseaseBrowseRows,
  type AdminDogDiseaseBrowseRow,
} from "./internal/browse-rows";
import type {
  AdminDogDiseaseBrowseRequestDb,
  AdminDogDiseaseBrowseResponseDb,
  AdminDogDiseaseDefinitionOptionDb,
} from "./types";

export async function listAdminDogDiseasesDb(
  input: AdminDogDiseaseBrowseRequestDb,
  diseaseDefinitions: AdminDogDiseaseDefinitionOptionDb[],
): Promise<AdminDogDiseaseBrowseResponseDb> {
  const diseaseOptions = mapDiseaseOptions(diseaseDefinitions);
  const diseaseGroupOptions = mapDiseaseGroupOptions(diseaseDefinitions);
  const where = buildDiseaseBrowseWhere(input);

  const total = await prisma.koiranSairaus.count({ where });
  if (total === 0) {
    return {
      selectedDiseaseCode: input.selectedDiseaseCode,
      selectedDiseaseGroup: input.selectedDiseaseGroup,
      query: input.query,
      total: 0,
      totalPages: 0,
      page: 1,
      diseaseGroupOptions,
      diseaseOptions,
      items: [],
    };
  }

  const totalPages = Math.max(1, Math.ceil(total / input.pageSize));
  const safePage = Math.min(input.page, totalPages);

  const rows = (await prisma.koiranSairaus.findMany({
    where,
    select: diseaseBrowseRowSelect,
    orderBy: [
      { sairaus: { sairausTeksti: "asc" } },
      { rekisterinumero: "asc" },
      { id: "asc" },
    ],
    skip: (safePage - 1) * input.pageSize,
    take: input.pageSize,
  })) as unknown as AdminDogDiseaseBrowseRow[];

  const parentLookup = await loadLitterParentPreviews(rows);

  return {
    selectedDiseaseCode: input.selectedDiseaseCode,
    selectedDiseaseGroup: input.selectedDiseaseGroup,
    query: input.query,
    total,
    totalPages,
    page: safePage,
    diseaseGroupOptions,
    diseaseOptions,
    items: mapDiseaseBrowseRows(rows, parentLookup),
  };
}
