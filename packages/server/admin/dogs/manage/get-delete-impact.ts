import { getAdminDogDeleteImpactDb } from "@beagle/db";
import type {
  GetAdminDogDeleteImpactRequest,
  GetAdminDogDeleteImpactResponse,
} from "@beagle/contracts";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { parseDogId } from "@server/dogs/core";

export async function getAdminDogDeleteImpact(
  input: GetAdminDogDeleteImpactRequest,
): Promise<ServiceResult<GetAdminDogDeleteImpactResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.getAdminDogDeleteImpact",
  });

  const id = parseDogId(input.id);
  if (!id) {
    log.warn(
      { event: "invalid_dog_id", durationMs: Date.now() - startedAt },
      "admin dog delete impact rejected because dog id is invalid",
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
    const impact = await getAdminDogDeleteImpactDb(id);

    if (!impact) {
      log.warn(
        {
          event: "dog_not_found",
          dogId: id,
          durationMs: Date.now() - startedAt,
        },
        "admin dog delete impact failed because dog was not found",
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

    return {
      status: 200,
      body: {
        ok: true,
        data: impact,
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
      "admin dog delete impact failed",
    );
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load dog delete impact.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
