import { listAdminDogDiseasesDb } from "@beagle/db";
import type {
  AdminDogDiseaseBrowseRequest,
  AdminDogDiseaseBrowseResponse,
  CurrentUserDto,
} from "@beagle/contracts";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

export async function listAdminDogDiseases(
  input: AdminDogDiseaseBrowseRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<AdminDogDiseaseBrowseResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.listAdminDogDiseases",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  log.info(
    {
      event: "start",
      diseaseCode: input.diseaseCode ?? null,
      page: input.page ?? 1,
    },
    "admin dog diseases browse started",
  );

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin dog diseases browse rejected by authorization",
    );

    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  try {
    const result = await listAdminDogDiseasesDb({
      diseaseCode: input.diseaseCode ?? undefined,
      page: input.page,
      pageSize: 15,
    });

    log.info(
      {
        event: "success",
        selectedDiseaseCode: result.selectedDiseaseCode,
        total: result.total,
        itemCount: result.items.length,
        durationMs: Date.now() - startedAt,
      },
      "admin dog diseases browse succeeded",
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
      "admin dog diseases browse failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin dog diseases.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
