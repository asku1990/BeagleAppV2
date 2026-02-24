"use server";

import type { HomeStatisticsResponse } from "@beagle/contracts";
import { statsService, toErrorLog } from "@beagle/server";
import { createActionLogger } from "@/lib/server/action-logger";

export type HomeStatisticsActionResult = {
  data: HomeStatisticsResponse | null;
  hasError: boolean;
};

export async function getHomeStatisticsAction(): Promise<HomeStatisticsActionResult> {
  const startedAt = Date.now();
  const { log, requestId } = await createActionLogger({
    action: "getHomeStatisticsAction",
  });
  log.info({ event: "start" }, "get home statistics action started");

  try {
    const result = await statsService.getHomeStatistics({ requestId });
    if (!result.body.ok) {
      log.warn(
        {
          event: "failure",
          status: result.status,
          durationMs: Date.now() - startedAt,
        },
        "get home statistics action failed",
      );
      return { data: null, hasError: true };
    }

    log.info(
      {
        event: "success",
        durationMs: Date.now() - startedAt,
      },
      "get home statistics action succeeded",
    );
    return { data: result.body.data, hasError: false };
  } catch (error) {
    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "get home statistics action threw",
    );
    throw error;
  }
}
