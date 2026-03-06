"use server";

import type { BeagleShowDetailsResponse } from "@beagle/contracts";
import { showsService, toErrorLog } from "@beagle/server";
import { createActionLogger } from "@/lib/server/action-logger";

export type GetBeagleShowDetailsActionResult = {
  data: BeagleShowDetailsResponse | null;
  hasError: boolean;
  status: number;
  error?: string;
};

function normalizeShowId(value: string): string {
  return value.trim();
}

export async function getBeagleShowDetailsAction(
  showId: string,
): Promise<GetBeagleShowDetailsActionResult> {
  const startedAt = Date.now();
  const { log, requestId } = await createActionLogger({
    action: "getBeagleShowDetailsAction",
  });
  const normalizedShowId = normalizeShowId(showId);
  log.info(
    { event: "start", showId: normalizedShowId || "(empty)" },
    "get beagle show details action started",
  );

  if (!normalizedShowId) {
    log.warn(
      { event: "invalid_show_id", durationMs: Date.now() - startedAt },
      "get beagle show details action rejected because show id is invalid",
    );
    return {
      data: null,
      hasError: true,
      status: 400,
      error: "Invalid show id.",
    };
  }

  try {
    const result = await showsService.getBeagleShowDetails(normalizedShowId, {
      requestId,
    });
    if (!result.body.ok) {
      log.warn(
        {
          event: "failure",
          status: result.status,
          durationMs: Date.now() - startedAt,
        },
        "get beagle show details action failed",
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
        showId: normalizedShowId,
        dogCount: result.body.data.items.length,
        durationMs: Date.now() - startedAt,
      },
      "get beagle show details action succeeded",
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
        showId: normalizedShowId,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "get beagle show details action threw",
    );
    return {
      data: null,
      hasError: true,
      status: 500,
      error: "Failed to load show details.",
    };
  }
}
