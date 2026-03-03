import type { HomeStatisticsResponse } from "@beagle/contracts";
import { getHomeStatisticsSnapshot } from "@beagle/db";
import type { ServiceResult } from "../../shared/result";
import { toErrorLog, withLogContext } from "../../shared/logger";
import { toHomeStatisticsResponse } from "./to-home-statistics-response";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

export async function getHomeStatistics(
  context?: ServiceLogContext,
): Promise<ServiceResult<HomeStatisticsResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "stats.getHomeStatistics",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });
  log.info({ event: "start" }, "home statistics query started");
  try {
    const snapshot = await getHomeStatisticsSnapshot();
    log.info(
      {
        event: "success",
        durationMs: Date.now() - startedAt,
      },
      "home statistics query succeeded",
    );
    return {
      status: 200,
      body: {
        ok: true,
        data: toHomeStatisticsResponse(snapshot),
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "home statistics query failed",
    );
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load statistics.",
      },
    };
  }
}
