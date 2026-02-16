import {
  getNewestBeagleDogsDb,
  searchBeagleDogsDb,
  type BeagleSearchSortDb,
} from "@beagle/db";
import type {
  BeagleNewestRequest,
  BeagleNewestResponse,
  BeagleSearchRequest,
  BeagleSearchResponse,
} from "@beagle/contracts";
import type { ServiceResult } from "../shared/result";

const ALLOWED_SORTS: ReadonlySet<BeagleSearchSortDb> = new Set([
  "name-asc",
  "birth-desc",
  "reg-desc",
  "created-desc",
]);

function parseSort(
  value: string | undefined,
): { ok: true; value: BeagleSearchSortDb } | { ok: false } {
  if (!value) {
    return { ok: true, value: "name-asc" };
  }
  if (ALLOWED_SORTS.has(value as BeagleSearchSortDb)) {
    return { ok: true, value: value as BeagleSearchSortDb };
  }
  return { ok: false };
}

function parsePage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value ?? 1));
}

function parsePageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 10;
  return Math.min(100, Math.max(1, Math.floor(value ?? 10)));
}

function parseNewestLimit(value: number | undefined): number {
  if (!Number.isFinite(value)) return 5;
  return Math.min(20, Math.max(1, Math.floor(value ?? 5)));
}

export function createDogsService() {
  return {
    async searchBeagleDogs(
      input: BeagleSearchRequest,
    ): Promise<ServiceResult<BeagleSearchResponse>> {
      const sortResult = parseSort(input.sort);
      if (!sortResult.ok) {
        return {
          status: 400,
          body: {
            ok: false,
            error: "Invalid sort value.",
          },
        };
      }

      try {
        const result = await searchBeagleDogsDb({
          ek: input.ek,
          reg: input.reg,
          name: input.name,
          sex: input.sex,
          birthYearFrom: input.birthYearFrom,
          birthYearTo: input.birthYearTo,
          ekOnly: input.ekOnly,
          multipleRegsOnly: input.multipleRegsOnly,
          page: parsePage(input.page),
          pageSize: parsePageSize(input.pageSize),
          sort: sortResult.value,
        });

        return {
          status: 200,
          body: {
            ok: true,
            data: {
              mode: result.mode,
              total: result.total,
              totalPages: result.totalPages,
              page: result.page,
              items: result.items.map((item) => ({
                id: item.id,
                ekNo: item.ekNo,
                registrationNo: item.registrationNo,
                registrationNos: item.registrationNos,
                createdAt: item.createdAt.toISOString(),
                sex: item.sex,
                name: item.name,
                birthDate: item.birthDate?.toISOString() ?? null,
                sire: item.sire,
                dam: item.dam,
                trialCount: item.trialCount,
                showCount: item.showCount,
              })),
            },
          },
        };
      } catch (error) {
        console.error("[dogsService.searchBeagleDogs] failed", error);
        return {
          status: 500,
          body: {
            ok: false,
            error: "Failed to load beagle search results.",
          },
        };
      }
    },

    async getNewestBeagleDogs(
      input: BeagleNewestRequest = {},
    ): Promise<ServiceResult<BeagleNewestResponse>> {
      try {
        const items = await getNewestBeagleDogsDb(
          parseNewestLimit(input.limit),
        );
        return {
          status: 200,
          body: {
            ok: true,
            data: {
              items: items.map((item) => ({
                id: item.id,
                ekNo: item.ekNo,
                registrationNo: item.registrationNo,
                registrationNos: item.registrationNos,
                createdAt: item.createdAt.toISOString(),
                sex: item.sex,
                name: item.name,
                birthDate: item.birthDate?.toISOString() ?? null,
                sire: item.sire,
                dam: item.dam,
                trialCount: item.trialCount,
                showCount: item.showCount,
              })),
            },
          },
        };
      } catch (error) {
        console.error("[dogsService.getNewestBeagleDogs] failed", error);
        return {
          status: 500,
          body: {
            ok: false,
            error: "Failed to load newest beagles.",
          },
        };
      }
    },
  };
}

export const dogsService = createDogsService();
