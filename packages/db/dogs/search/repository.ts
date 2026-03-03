import type { Prisma } from "@prisma/client";
import { prisma } from "../../core/prisma";
import { loadDogs } from "../core/dog-row-loader";
import { compareByRegistrationDesc } from "../core/registration";
import { toSearchRow } from "../core/search-row-mapper";
import { resolveDbOrderBy } from "./internal/db-order";
import {
  normalizeBirthYear,
  normalizeSex,
  normalizeText,
  parsePage,
  parsePageSize,
  parseSort,
} from "./internal/input-parsing";
import {
  loadDogIdsWithMultipleRegistrations,
  loadRegistrationOrderKeys,
} from "./internal/data-access";
import { matchesRow } from "./internal/matches-row";
import { resolveMode } from "./internal/mode";
import { resolvePagination } from "./internal/pagination";
import { sortRows } from "./internal/sorting";
import type { SearchField } from "./internal/types";
import { buildPattern, hasWildcard } from "./internal/wildcard";
import { buildWhere } from "./internal/where-clause";

export type BeagleSearchSortDb =
  | "name-asc"
  | "birth-desc"
  | "reg-desc"
  | "created-desc"
  | "ek-asc";

export type BeagleSearchModeDb = "none" | "ek" | "reg" | "name" | "combined";

export type BeagleSearchRequestDb = {
  ek?: string;
  reg?: string;
  name?: string;
  sex?: "male" | "female";
  birthYearFrom?: number;
  birthYearTo?: number;
  ekOnly?: boolean;
  multipleRegsOnly?: boolean;
  page?: number;
  pageSize?: number;
  sort?: BeagleSearchSortDb;
};

export type BeagleSearchRowDb = {
  id: string;
  ekNo: number | null;
  registrationNo: string;
  registrationNos: string[];
  createdAt: Date;
  sex: "U" | "N" | "-";
  name: string;
  birthDate: Date | null;
  sire: string;
  dam: string;
  trialCount: number;
  showCount: number;
};

export type BeagleSearchResponseDb = {
  mode: BeagleSearchModeDb;
  total: number;
  totalPages: number;
  page: number;
  items: BeagleSearchRowDb[];
};

export async function searchBeagleDogsDb(
  input: BeagleSearchRequestDb,
): Promise<BeagleSearchResponseDb> {
  const ek = normalizeText(input.ek);
  const reg = normalizeText(input.reg).toUpperCase();
  const name = normalizeText(input.name);
  const sex = normalizeSex(input.sex);
  const birthYearFrom = normalizeBirthYear(input.birthYearFrom);
  const birthYearTo = normalizeBirthYear(input.birthYearTo);
  const ekOnly = input.ekOnly === true;
  const multipleRegsOnly = input.multipleRegsOnly === true;

  const mode = resolveMode({ ek, reg, name });
  const hasAdvancedFilters =
    multipleRegsOnly ||
    ekOnly ||
    sex != null ||
    birthYearFrom != null ||
    birthYearTo != null;
  const effectiveMode: BeagleSearchModeDb =
    mode === "none" && hasAdvancedFilters ? "combined" : mode;
  if (mode === "none" && !hasAdvancedFilters) {
    return {
      mode: effectiveMode,
      total: 0,
      totalPages: 0,
      page: 1,
      items: [],
    };
  }

  const sort = parseSort(input.sort);
  const page = parsePage(input.page);
  const pageSize = parsePageSize(input.pageSize);

  const patterns: Record<SearchField, string> = {
    ek: buildPattern("ek", ek),
    reg: buildPattern("reg", reg),
    name: buildPattern("name", name),
  };

  const baseWhere = buildWhere({
    ek,
    reg,
    name,
    sex,
    birthYearFrom,
    birthYearTo,
    ekOnly,
  });
  const multiRegistrationDogIds = multipleRegsOnly
    ? await loadDogIdsWithMultipleRegistrations(baseWhere)
    : null;

  if (multipleRegsOnly && (multiRegistrationDogIds?.length ?? 0) === 0) {
    return {
      mode: effectiveMode,
      total: 0,
      totalPages: 0,
      page: 1,
      items: [],
    };
  }

  const where: Prisma.DogWhereInput =
    multipleRegsOnly && multiRegistrationDogIds
      ? {
          AND: [
            baseWhere,
            {
              id: {
                in: multiRegistrationDogIds,
              },
            },
          ],
        }
      : baseWhere;

  const needsWildcardFilter =
    hasWildcard(ek) || hasWildcard(reg) || hasWildcard(name);
  const requiresInMemoryFilter = needsWildcardFilter;
  const dbOrderBy = resolveDbOrderBy(sort);

  if (!requiresInMemoryFilter && dbOrderBy) {
    const total = await prisma.dog.count({ where });
    const pagination = resolvePagination(total, page, pageSize);
    const rows = await loadDogs({
      where,
      orderBy: dbOrderBy,
      skip: pagination.start,
      take: pageSize,
    });

    return {
      mode: effectiveMode,
      total,
      totalPages: pagination.totalPages,
      page: pagination.page,
      items: rows.map(toSearchRow),
    };
  }

  if (!requiresInMemoryFilter && sort === "reg-desc") {
    const orderKeys = await loadRegistrationOrderKeys(where);
    const sortedOrderKeys = [...orderKeys].sort((left, right) => {
      const registrationComparison = compareByRegistrationDesc(
        left.primaryRegistrationNo,
        right.primaryRegistrationNo,
      );
      if (registrationComparison !== 0) return registrationComparison;
      return right.id.localeCompare(left.id, "fi", { sensitivity: "base" });
    });

    const total = sortedOrderKeys.length;
    const pagination = resolvePagination(total, page, pageSize);
    const pageIds = sortedOrderKeys
      .slice(pagination.start, pagination.start + pageSize)
      .map((item) => item.id);

    if (pageIds.length === 0) {
      return {
        mode: effectiveMode,
        total,
        totalPages: pagination.totalPages,
        page: pagination.page,
        items: [],
      };
    }

    const rows = await loadDogs({
      where: {
        id: { in: pageIds },
      },
    });

    const orderById = new Map(pageIds.map((id, index) => [id, index]));
    rows.sort(
      (left, right) =>
        (orderById.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (orderById.get(right.id) ?? Number.MAX_SAFE_INTEGER),
    );

    return {
      mode: effectiveMode,
      total,
      totalPages: pagination.totalPages,
      page: pagination.page,
      items: rows.map(toSearchRow),
    };
  }

  const allRows = await loadDogs({ where });
  const filteredRows = allRows.filter((row) => {
    if (needsWildcardFilter && !matchesRow(row, patterns)) {
      return false;
    }
    if (multipleRegsOnly && row.registrationNos.length < 2) {
      return false;
    }
    return true;
  });
  const sortedRows = sortRows(filteredRows, sort);

  const total = sortedRows.length;
  const pagination = resolvePagination(total, page, pageSize);
  const paged = sortedRows
    .slice(pagination.start, pagination.start + pageSize)
    .map(toSearchRow);

  return {
    mode: effectiveMode,
    total,
    totalPages: pagination.totalPages,
    page: pagination.page,
    items: paged,
  };
}
