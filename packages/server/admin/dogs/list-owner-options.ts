import { listAdminOwnerOptionsDb } from "@beagle/db";
import type {
  AdminDogLookupRequest,
  AdminOwnerLookupResponse,
  CurrentUserDto,
} from "@beagle/contracts";
import { toErrorLog, withLogContext } from "../../shared/logger";
import type { ServiceResult } from "../../shared/result";
import { requireAdmin } from "../service";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function normalizeQuery(value: string | undefined): string {
  return (value ?? "").trim();
}

function parseLimit(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_LIMIT;
  }

  return Math.min(MAX_LIMIT, Math.max(1, Math.floor(value ?? DEFAULT_LIMIT)));
}

export async function listAdminOwnerOptions(
  input: AdminDogLookupRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<AdminOwnerLookupResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.listAdminOwnerOptions",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  const query = normalizeQuery(input.query);
  const limit = parseLimit(input.limit);

  log.info(
    { event: "start", query, limit },
    "admin dog owner options lookup started",
  );

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin dog owner options lookup rejected by authorization",
    );

    return { status: authResult.status, body: authResult.body };
  }

  try {
    const result = await listAdminOwnerOptionsDb({ query, limit });

    log.info(
      {
        event: "success",
        itemCount: result.items.length,
        durationMs: Date.now() - startedAt,
      },
      "admin dog owner options lookup succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          items: result.items.map((item) => ({
            id: item.id,
            name: item.name,
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
      "admin dog owner options lookup failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load owner options.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
