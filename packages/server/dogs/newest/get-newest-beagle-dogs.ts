import { getNewestBeagleDogsDb } from "@beagle/db";
import type {
  BeagleNewestRequest,
  BeagleNewestResponse,
} from "@beagle/contracts";
import { toBusinessDateOnly } from "../../core/date-only";
import type { ServiceResult } from "../../core/result";
import { toErrorLog, withLogContext } from "../../core/logger";
import type { DogsServiceLogContext } from "../profile/get-beagle-dog-profile";

function parseNewestLimit(value: number | undefined): number {
  if (!Number.isFinite(value)) return 5;
  return Math.min(20, Math.max(1, Math.floor(value ?? 5)));
}

export async function getNewestBeagleDogsService(
  input: BeagleNewestRequest = {},
  context?: DogsServiceLogContext,
): Promise<ServiceResult<BeagleNewestResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "dogs.getNewestBeagleDogs",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });
  log.info(
    {
      event: "start",
      limit: input.limit ?? 5,
    },
    "newest dogs query started",
  );
  try {
    const items = await getNewestBeagleDogsDb(parseNewestLimit(input.limit));
    log.info(
      {
        event: "success",
        itemCount: items.length,
        durationMs: Date.now() - startedAt,
      },
      "newest dogs query succeeded",
    );
    return {
      status: 200,
      body: {
        ok: true,
        data: {
          items: items.map((item) => ({
            id: item.id,
            ekNo: item.ekNo,
            registrationNo: item.registrationNo,
            registrationNos: item.registrationNos,
            createdAt: item.createdAt.toISOString(),
            sex: item.sex,
            name: item.name,
            birthDate: item.birthDate
              ? toBusinessDateOnly(item.birthDate)
              : null,
            sire: item.sire,
            dam: item.dam,
            trialCount: item.trialCount,
            showCount: item.showCount,
          })),
        },
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "newest dogs query failed",
    );
    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load newest beagles.",
      },
    };
  }
}
