"use server";

import type {
  CalculatePublicVirtualPairingRequest,
  CalculatePublicVirtualPairingResponse,
} from "@beagle/contracts";
import { calculatePublicVirtualPairing, toErrorLog } from "@beagle/server";
import { createActionLogger } from "@/lib/server/action-logger";

export type CalculatePublicVirtualPairingActionResult = {
  data: CalculatePublicVirtualPairingResponse | null;
  hasError: boolean;
  error?: string;
};

export async function calculatePublicVirtualPairingAction(
  input: CalculatePublicVirtualPairingRequest,
): Promise<CalculatePublicVirtualPairingActionResult> {
  const startedAt = Date.now();
  const { log, requestId } = await createActionLogger({
    action: "calculatePublicVirtualPairingAction",
  });

  log.info(
    {
      event: "start",
      hasSireRegistrationNo: Boolean(input.sireRegistrationNo?.trim()),
      hasDamRegistrationNo: Boolean(input.damRegistrationNo?.trim()),
      generationDepth: input.generationDepth ?? 9,
    },
    "public virtual pairing calculation started",
  );

  try {
    const result = await calculatePublicVirtualPairing(input);
    if (!result.body.ok) {
      log.warn(
        {
          event: "failure",
          status: result.status,
          durationMs: Date.now() - startedAt,
          requestId,
        },
        "public virtual pairing calculation failed",
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
        sireId: result.body.data.sire.id,
        damId: result.body.data.dam.id,
        generationDepth: result.body.data.generationDepth,
        durationMs: Date.now() - startedAt,
      },
      "public virtual pairing calculation succeeded",
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
      "public virtual pairing calculation threw",
    );
    return {
      data: null,
      hasError: true,
      error: "Failed to calculate virtual pairing data.",
    };
  }
}
