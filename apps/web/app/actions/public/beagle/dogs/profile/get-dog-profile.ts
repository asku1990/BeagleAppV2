"use server";

import type { BeagleDogProfileDto } from "@beagle/contracts";
import { dogsService, toErrorLog } from "@beagle/server";
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
  log.info({ event: "start", dogId }, "get dog profile action started");

  try {
    const result = await dogsService.getBeagleDogProfile(dogId, { requestId });
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
        dogId,
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
        dogId,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "get dog profile action threw",
    );
    throw error;
  }
}
