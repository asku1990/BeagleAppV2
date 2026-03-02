import { searchBeagleDogsDb, type BeagleSearchSortDb } from "@beagle/db";
import type {
  BeagleNewestRequest,
  BeagleNewestResponse,
  BeagleSearchRequest,
  BeagleSearchResponse,
  BeagleDogProfileDto,
} from "@beagle/contracts";
import { toBusinessDateOnly } from "../shared/date-only";
import type { ServiceResult } from "../shared/result";
import { toErrorLog, withLogContext } from "../shared/logger";
import {
  getBeagleDogProfileService,
  type DogsServiceLogContext,
} from "./profile/get-beagle-dog-profile";
import { getNewestBeagleDogsService } from "./newest";

const ALLOWED_SORTS: ReadonlySet<BeagleSearchSortDb> = new Set([
  "name-asc",
  "birth-desc",
  "reg-desc",
  "created-desc",
  "ek-asc",
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

export function createDogsService() {
  return {
    async searchBeagleDogs(
      input: BeagleSearchRequest,
      context?: DogsServiceLogContext,
    ): Promise<ServiceResult<BeagleSearchResponse>> {
      const startedAt = Date.now();
      const log = withLogContext({
        layer: "service",
        useCase: "dogs.searchBeagleDogs",
        ...(context?.requestId ? { requestId: context.requestId } : {}),
        ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
      });
      log.info(
        {
          event: "start",
          sort: input.sort ?? "name-asc",
          page: input.page ?? 1,
          pageSize: input.pageSize ?? 10,
        },
        "dogs search started",
      );
      const sortResult = parseSort(input.sort);
      if (!sortResult.ok) {
        log.warn(
          {
            event: "invalid_sort",
            sort: input.sort,
            durationMs: Date.now() - startedAt,
          },
          "dogs search rejected because sort is invalid",
        );
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
        log.info(
          {
            event: "success",
            total: result.total,
            itemCount: result.items.length,
            mode: result.mode,
            durationMs: Date.now() - startedAt,
          },
          "dogs search succeeded",
        );

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
                birthDate: item.birthDate
                  ? toBusinessDateOnly(item.birthDate)
                  : null,
                sire: item.sire,
                dam: item.dam,
                trialCount: item.trialCount,
                showCount: item.showCount,
              })),
            },
          },
        };
      } catch (error) {
        log.error(
          {
            event: "exception",
            durationMs: Date.now() - startedAt,
            ...toErrorLog(error),
          },
          "dogs search failed",
        );
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
      context?: DogsServiceLogContext,
    ): Promise<ServiceResult<BeagleNewestResponse>> {
      return getNewestBeagleDogsService(input, context);
    },

    async getBeagleDogProfile(
      dogId: string,
      context?: DogsServiceLogContext,
    ): Promise<ServiceResult<BeagleDogProfileDto>> {
      return getBeagleDogProfileService(dogId, context);
    },
  };
}

export const dogsService = createDogsService();
