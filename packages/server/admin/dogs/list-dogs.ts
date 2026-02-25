import { listAdminDogsDb, type AdminDogListSortDb } from "@beagle/db";
import type {
  AdminDogListRequest,
  AdminDogListResponse,
  CurrentUserDto,
} from "@beagle/contracts";
import type { ServiceResult } from "../../shared/result";
import { requireAdmin } from "../service";
import { toErrorLog, withLogContext } from "../../shared/logger";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

const ALLOWED_SORTS: ReadonlySet<AdminDogListSortDb> = new Set([
  "name-asc",
  "birth-desc",
  "created-desc",
]);

function parseQuery(value: string | undefined): string {
  return (value ?? "").trim();
}

function parseSort(
  value: string | undefined,
): { ok: true; value: AdminDogListSortDb } | { ok: false } {
  if (!value) {
    return { ok: true, value: "name-asc" };
  }

  if (ALLOWED_SORTS.has(value as AdminDogListSortDb)) {
    return { ok: true, value: value as AdminDogListSortDb };
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

function parseSex(
  value: string | undefined,
):
  | { ok: true; value: "MALE" | "FEMALE" | "UNKNOWN" | undefined }
  | { ok: false } {
  if (!value) {
    return { ok: true, value: undefined };
  }

  if (value === "MALE" || value === "FEMALE" || value === "UNKNOWN") {
    return { ok: true, value };
  }

  return { ok: false };
}

export async function listAdminDogs(
  input: AdminDogListRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<AdminDogListResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.listAdminDogs",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  log.info(
    {
      event: "start",
      query: parseQuery(input.query),
      sex: input.sex ?? null,
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 20,
      sort: input.sort ?? "name-asc",
    },
    "admin dogs list started",
  );

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin dogs list rejected by authorization",
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
      "admin dogs list rejected because sort is invalid",
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

  const parsedSex = parseSex(input.sex);
  if (!parsedSex.ok) {
    log.warn(
      {
        event: "invalid_sex",
        sex: input.sex,
        durationMs: Date.now() - startedAt,
      },
      "admin dogs list rejected because sex is invalid",
    );

    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid sex value.",
        code: "INVALID_SEX",
      },
    };
  }

  try {
    const result = await listAdminDogsDb({
      query: parseQuery(input.query),
      sex: parsedSex.value,
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
      "admin dogs list succeeded",
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
            id: item.id,
            registrationNo: item.registrationNo,
            name: item.name,
            sex: item.sex,
            birthDate: item.birthDate?.toISOString() ?? null,
            breederName: item.breederName,
            ownerNames: item.ownerNames,
            sire: item.sire,
            dam: item.dam,
            trialCount: item.trialCount,
            showCount: item.showCount,
            ekNo: item.ekNo,
            note: item.note,
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
      "admin dogs list failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin dogs.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
