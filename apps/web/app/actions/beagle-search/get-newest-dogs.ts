"use server";

import type {
  BeagleNewestRequest,
  BeagleNewestResponse,
} from "@beagle/contracts";
import { dogsService, toErrorLog } from "@beagle/server";
import { createActionLogger } from "@/lib/server/action-logger";

export type GetNewestDogsActionResult = {
  data: BeagleNewestResponse | null;
  hasError: boolean;
  error?: string;
};

export async function getNewestDogsAction(
  input: BeagleNewestRequest = {},
): Promise<GetNewestDogsActionResult> {
  const startedAt = Date.now();
  const { log, requestId } = await createActionLogger({
    action: "getNewestDogsAction",
  });
  log.info(
    {
      event: "start",
      limit: input.limit ?? 5,
    },
    "get newest dogs action started",
  );

  try {
    const result = await dogsService.getNewestBeagleDogs(input, { requestId });
    if (!result.body.ok) {
      log.warn(
        {
          event: "failure",
          status: result.status,
          durationMs: Date.now() - startedAt,
        },
        "get newest dogs action failed",
      );
      return {
        data: null,
        hasError: true,
        error: result.body.error,
      };
    }

    log.info(
      {
        event: "success",
        itemCount: result.body.data.items.length,
        durationMs: Date.now() - startedAt,
      },
      "get newest dogs action succeeded",
    );

    return {
      data: result.body.data,
      hasError: false,
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "get newest dogs action threw",
    );
    throw error;
  }
}
