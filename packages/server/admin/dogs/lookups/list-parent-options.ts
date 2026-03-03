import { listAdminDogParentOptionsDb } from "@beagle/db";
import type {
  AdminDogLookupRequest,
  AdminDogParentLookupResponse,
  CurrentUserDto,
} from "@beagle/contracts";
import { toErrorLog, withLogContext } from "../../../core/logger";
import type { ServiceResult } from "../../../core/result";
import { requireAdmin } from "../../core/service";
import { normalizeQuery, parseLookupLimit } from "../manage/normalization";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

export async function listAdminDogParentOptions(
  input: AdminDogLookupRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<AdminDogParentLookupResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.listAdminDogParentOptions",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  const query = normalizeQuery(input.query);
  const limit = parseLookupLimit(input.limit);

  log.info(
    { event: "start", query, limit },
    "admin dog parent options lookup started",
  );

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin dog parent options lookup rejected by authorization",
    );

    return { status: authResult.status, body: authResult.body };
  }

  try {
    const result = await listAdminDogParentOptionsDb({ query, limit });

    log.info(
      {
        event: "success",
        itemCount: result.items.length,
        durationMs: Date.now() - startedAt,
      },
      "admin dog parent options lookup succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          items: result.items.map((item) => ({
            id: item.id,
            name: item.name,
            sex: item.sex,
            registrationNo: item.registrationNo,
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
      "admin dog parent options lookup failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load parent options.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
