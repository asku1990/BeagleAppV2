import { searchAdminTrialsDb, type AdminTrialSearchSortDb } from "@beagle/db";
import type {
  AdminTrialSearchRequest,
  AdminTrialSearchResponse,
  CurrentUserDto,
} from "@beagle/contracts";
import { toBusinessDateOnly } from "@server/core/date-only";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { requireAdmin } from "@server/admin/core/service";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

const ALLOWED_SORTS: ReadonlySet<AdminTrialSearchSortDb> = new Set([
  "date-desc",
  "date-asc",
]);

function normalizeQuery(value: string | undefined): string {
  return (value ?? "").trim();
}

function parseSort(
  value: string | undefined,
): { ok: true; value: AdminTrialSearchSortDb } | { ok: false } {
  if (!value) {
    return { ok: true, value: "date-desc" };
  }

  if (ALLOWED_SORTS.has(value as AdminTrialSearchSortDb)) {
    return { ok: true, value: value as AdminTrialSearchSortDb };
  }

  return { ok: false };
}

function parsePage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value ?? 1));
}

function parsePageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 20;
  return Math.min(100, Math.max(1, Math.floor(value ?? 20)));
}

export async function listAdminTrials(
  input: AdminTrialSearchRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<AdminTrialSearchResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-trials.listAdminTrials",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  log.info(
    {
      event: "start",
      query: normalizeQuery(input.query),
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 20,
      sort: input.sort ?? "date-desc",
    },
    "admin trials list started",
  );

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin trials list rejected by authorization",
    );

    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  const parsedSort = parseSort(input.sort);
  if (!parsedSort.ok) {
    log.warn(
      {
        event: "invalid_sort",
        sort: input.sort,
        durationMs: Date.now() - startedAt,
      },
      "admin trials list rejected because sort is invalid",
    );

    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid sort value.",
        code: "INVALID_SORT",
      },
    };
  }

  try {
    const result = await searchAdminTrialsDb({
      query: normalizeQuery(input.query),
      page: parsePage(input.page),
      pageSize: parsePageSize(input.pageSize),
      sort: parsedSort.value,
    });

    log.info(
      {
        event: "success",
        total: result.total,
        itemCount: result.items.length,
        page: result.page,
        durationMs: Date.now() - startedAt,
      },
      "admin trials list succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          total: result.total,
          totalPages: result.totalPages,
          page: result.page,
          items: result.items.map((item) => ({
            trialId: item.trialId,
            dogName: item.dogName,
            registrationNo: item.registrationNo,
            sourceKey: item.sourceKey,
            eventDate: toBusinessDateOnly(item.eventDate),
            eventPlace: item.eventPlace,
            judge: item.judge,
            piste: item.piste,
            pa: item.pa,
            sija: item.sija,
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
      "admin trials list failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin trials.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
