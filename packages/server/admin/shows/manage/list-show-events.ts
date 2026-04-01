import {
  type CurrentUserDto,
  type AdminShowSearchRequest,
  type AdminShowSearchResponse,
} from "@beagle/contracts";
import {
  searchAdminShowEventsDb,
  type AdminShowSearchSortDb,
} from "@beagle/db";
import { toBusinessDateOnly } from "@server/core/date-only";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { requireAdmin } from "@server/admin/core/service";
import { encodeShowId } from "@server/shows/internal/show-id";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

type AdminShowSearchServiceInput = Omit<AdminShowSearchRequest, "sort"> & {
  sort?: string;
};

const ALLOWED_SORTS: ReadonlySet<AdminShowSearchSortDb> = new Set([
  "date-desc",
  "date-asc",
]);

function parseSort(
  value: string | undefined,
): { ok: true; value: AdminShowSearchSortDb } | { ok: false } {
  if (!value) {
    return { ok: true, value: "date-desc" };
  }

  if (ALLOWED_SORTS.has(value as AdminShowSearchSortDb)) {
    return { ok: true, value: value as AdminShowSearchSortDb };
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

function toEventDateIso(value: Date): string {
  return toBusinessDateOnly(value);
}

function normalizeQuery(value: string | undefined): string | undefined {
  const normalized = value?.trim() ?? "";
  return normalized ? normalized : undefined;
}

export async function listAdminShowEvents(
  input: AdminShowSearchServiceInput,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<AdminShowSearchResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-shows.listAdminShowEvents",
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
    "admin shows search started",
  );

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin shows search rejected by authorization",
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
      "admin shows search rejected because sort is invalid",
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
    const result = await searchAdminShowEventsDb({
      query: normalizeQuery(input.query),
      page: parsePage(input.page),
      pageSize: parsePageSize(input.pageSize),
      sort: parsedSort.value,
    });

    const data: AdminShowSearchResponse = {
      total: result.total,
      totalPages: result.totalPages,
      page: result.page,
      items: result.items.map((item) => ({
        showId: encodeShowId(
          toEventDateIso(item.eventDate),
          item.eventPlace,
          item.eventKey,
        ),
        eventDate: toEventDateIso(item.eventDate),
        eventPlace: item.eventPlace,
        eventCity: item.eventCity ?? "",
        eventName: item.eventName ?? "",
        eventType: item.eventType ?? "",
        organizer: item.organizer ?? "",
        judge: item.judge ?? "",
        dogCount: item.dogCount,
      })),
    };

    log.info(
      {
        event: "success",
        total: data.total,
        itemCount: data.items.length,
        page: data.page,
        durationMs: Date.now() - startedAt,
      },
      "admin shows search succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data,
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin shows search failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin show events.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
