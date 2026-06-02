import {
  deleteAdminDogDiseaseDb,
  runAdminDogDiseaseWriteTransactionDb,
  type AuditContextDb,
} from "@beagle/db";
import type {
  CurrentUserDto,
  DeleteAdminDogDiseaseRequest,
  DeleteAdminDogDiseaseResponse,
} from "@beagle/contracts";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";

export async function deleteAdminDogDisease(
  input: DeleteAdminDogDiseaseRequest,
  currentUser: CurrentUserDto | null,
  auditContext?: AuditContextDb,
): Promise<ServiceResult<DeleteAdminDogDiseaseResponse>> {
  const startedAt = Date.now();
  const id = input.id.trim();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.deleteAdminDogDisease",
    ...(auditContext?.actorUserId
      ? { actorUserId: auditContext.actorUserId }
      : {}),
  });

  if (!id) {
    log.warn(
      { event: "invalid_id", durationMs: Date.now() - startedAt },
      "admin dog disease delete rejected because id is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Disease row id is required.",
        code: "INVALID_DISEASE_ROW_ID",
      },
    };
  }

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin dog disease delete rejected by authorization",
    );
    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  log.info(
    {
      event: "start",
      diseaseRowId: id,
    },
    "admin dog disease delete started",
  );

  try {
    const result = await runAdminDogDiseaseWriteTransactionDb(
      (tx) => deleteAdminDogDiseaseDb(id, tx),
      { ...auditContext, intent: "DELETE_DOG_DISEASE" },
    );

    if (result.status === "not_found") {
      log.warn(
        {
          event: "not_found",
          diseaseRowId: id,
          durationMs: Date.now() - startedAt,
        },
        "admin dog disease delete failed because row was not found",
      );
      return {
        status: 404,
        body: {
          ok: false,
          error: "Disease row was not found.",
          code: "DISEASE_ROW_NOT_FOUND",
        },
      };
    }

    log.info(
      {
        event: "success",
        diseaseRowId: result.diseaseId,
        durationMs: Date.now() - startedAt,
      },
      "admin dog disease delete succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          deletedDiseaseId: result.diseaseId,
        },
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        diseaseRowId: id,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin dog disease delete failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to delete admin dog disease.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
