import { listAdminDogColorOptionsDb } from "@beagle/db";
import type {
  AdminDogColorLookupResponse,
  CurrentUserDto,
} from "@beagle/contracts";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

export async function listAdminDogColorOptions(
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<AdminDogColorLookupResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.listAdminDogColorOptions",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  log.info({ event: "start" }, "admin dog color options lookup started");

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin dog color options lookup rejected by authorization",
    );

    return { status: authResult.status, body: authResult.body };
  }

  try {
    const result = await listAdminDogColorOptionsDb();

    log.info(
      {
        event: "success",
        itemCount: result.items.length,
        durationMs: Date.now() - startedAt,
      },
      "admin dog color options lookup succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: result,
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin dog color options lookup failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load dog color options.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
