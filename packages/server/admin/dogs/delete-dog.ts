import {
  deleteAdminDogWriteDb,
  runAdminDogWriteTransactionDb,
  type AuditContextDb,
} from "@beagle/db";
import type {
  DeleteAdminDogRequest,
  DeleteAdminDogResponse,
} from "@beagle/contracts";
import { toErrorLog, withLogContext } from "../../shared/logger";
import type { ServiceResult } from "../../shared/result";

function normalizeRequiredId(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export async function deleteAdminDog(
  input: DeleteAdminDogRequest,
  auditContext?: AuditContextDb,
): Promise<ServiceResult<DeleteAdminDogResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.deleteAdminDog",
    ...(auditContext?.actorUserId
      ? { actorUserId: auditContext.actorUserId }
      : {}),
  });

  log.info({ event: "start", dogId: input.id }, "admin dog delete started");

  const id = normalizeRequiredId(input.id);
  if (!id) {
    log.warn(
      { event: "invalid_dog_id", durationMs: Date.now() - startedAt },
      "admin dog delete rejected because dog id is invalid",
    );
    return {
      status: 400,
      body: {
        ok: false,
        error: "Dog id is required.",
        code: "INVALID_DOG_ID",
      },
    };
  }

  try {
    const deleted = await runAdminDogWriteTransactionDb(
      async (tx) => deleteAdminDogWriteDb(id, tx),
      { ...auditContext, intent: "DELETE_DOG" },
    );

    if (!deleted) {
      log.warn(
        {
          event: "dog_not_found",
          dogId: id,
          durationMs: Date.now() - startedAt,
        },
        "admin dog delete failed because dog was not found",
      );
      return {
        status: 404,
        body: {
          ok: false,
          error: "Dog not found.",
          code: "DOG_NOT_FOUND",
        },
      };
    }

    log.info(
      { event: "success", dogId: id, durationMs: Date.now() - startedAt },
      "admin dog delete succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          deletedDogId: id,
        },
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        dogId: id,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin dog delete failed",
    );
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to delete dog.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
