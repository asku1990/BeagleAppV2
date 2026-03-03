import { listAdminBreederOptionsDb } from "@beagle/db";
import type {
  AdminBreederLookupResponse,
  AdminDogLookupRequest,
  CurrentUserDto,
} from "@beagle/contracts";
import { toErrorLog, withLogContext } from "../../../shared/logger";
import type { ServiceResult } from "../../../shared/result";
import { requireAdmin } from "../../core/service";
import { normalizeQuery, parseLookupLimit } from "../manage/normalization";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

export async function listAdminBreederOptions(
  input: AdminDogLookupRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<AdminBreederLookupResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.listAdminBreederOptions",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  const query = normalizeQuery(input.query);
  const limit = parseLookupLimit(input.limit);

  log.info(
    { event: "start", query, limit },
    "admin dog breeder options lookup started",
  );

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin dog breeder options lookup rejected by authorization",
    );

    return { status: authResult.status, body: authResult.body };
  }

  try {
    const result = await listAdminBreederOptionsDb({ query, limit });

    log.info(
      {
        event: "success",
        itemCount: result.items.length,
        durationMs: Date.now() - startedAt,
      },
      "admin dog breeder options lookup succeeded",
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
      "admin dog breeder options lookup failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load breeder options.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
