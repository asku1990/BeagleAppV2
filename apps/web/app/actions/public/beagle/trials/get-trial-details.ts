"use server";

import type { BeagleTrialDetailsResponse } from "@beagle/contracts";
import { trialsService, toErrorLog } from "@beagle/server";
import { createActionLogger } from "@/lib/server/action-logger";

export type GetBeagleTrialDetailsActionResult = {
  data: BeagleTrialDetailsResponse | null;
  hasError: boolean;
  status: number;
  error?: string;
};

function normalizeTrialId(value: string): string {
  return value.trim();
}

export async function getBeagleTrialDetailsAction(
  trialId: string,
): Promise<GetBeagleTrialDetailsActionResult> {
  const startedAt = Date.now();
  const { log, requestId } = await createActionLogger({
    action: "getBeagleTrialDetailsAction",
  });
  const normalizedTrialId = normalizeTrialId(trialId);
  log.info(
    { event: "start", trialId: normalizedTrialId || "(empty)" },
    "get beagle trial details action started",
  );

  if (!normalizedTrialId) {
    log.warn(
      { event: "invalid_trial_id", durationMs: Date.now() - startedAt },
      "get beagle trial details action rejected because trial id is invalid",
    );
    return {
      data: null,
      hasError: true,
      status: 400,
      error: "Invalid trial id.",
    };
  }

  try {
    const result = await trialsService.getBeagleTrialDetails(
      normalizedTrialId,
      {
        requestId,
      },
    );
    if (!result.body.ok) {
      log.warn(
        {
          event: "failure",
          status: result.status,
          durationMs: Date.now() - startedAt,
        },
        "get beagle trial details action failed",
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
        trialId: normalizedTrialId,
        dogCount: result.body.data.items.length,
        durationMs: Date.now() - startedAt,
      },
      "get beagle trial details action succeeded",
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
        trialId: normalizedTrialId,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "get beagle trial details action threw",
    );
    return {
      data: null,
      hasError: true,
      status: 500,
      error: "Failed to load trial details.",
    };
  }
}
