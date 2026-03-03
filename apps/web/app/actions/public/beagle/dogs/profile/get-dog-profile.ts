"use server";

import type { BeagleDogProfileDto } from "@beagle/contracts";
import { dogsService, parseDogId, toErrorLog } from "@beagle/server";
import { createActionLogger } from "@/lib/server/action-logger";

export type GetDogProfileActionResult = {
  data: BeagleDogProfileDto | null;
  hasError: boolean;
  status: number;
  error?: string;
};

export async function getDogProfileAction(
  dogId: string,
): Promise<GetDogProfileActionResult> {
  const startedAt = Date.now();
  const { log, requestId } = await createActionLogger({
    action: "getDogProfileAction",
  });
  const parsedDogId = parseDogId(dogId);
  log.info(
    { event: "start", dogId: parsedDogId ?? dogId },
    "get dog profile action started",
  );

  if (!parsedDogId) {
    log.warn(
      { event: "invalid_dog_id", durationMs: Date.now() - startedAt },
      "get dog profile action rejected because dog id is invalid",
    );
    return {
      data: null,
      hasError: true,
      status: 400,
      error: "Invalid dog id.",
    };
  }

  try {
    const result = await dogsService.getBeagleDogProfile(parsedDogId, {
      requestId,
    });
    if (!result.body.ok) {
      log.warn(
        {
          event: "failure",
          status: result.status,
          durationMs: Date.now() - startedAt,
        },
        "get dog profile action failed",
      );
      return {
        data: null,
        hasError: true,
        status: result.status,
        error: result.body.error,
      };
    }

    log.info(
      {
        event: "success",
        dogId: parsedDogId,
        durationMs: Date.now() - startedAt,
      },
      "get dog profile action succeeded",
    );

    return {
      data: result.body.data,
      hasError: false,
      status: 200,
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        dogId: parsedDogId,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "get dog profile action threw",
    );
    return {
      data: null,
      hasError: true,
      status: 500,
      error: "Failed to load dog profile.",
    };
  }
}
