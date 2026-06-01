import { searchVirtualPairingDogsDb } from "@beagle/db";
import type {
  VirtualPairingSearchRequest,
  VirtualPairingSearchResponse,
} from "@beagle/contracts";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import type { DogsServiceLogContext } from "@server/dogs/profile/get-beagle-dog-profile";

function parsePage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value ?? 1));
}

function parsePageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 10;
  return Math.min(50, Math.max(1, Math.floor(value ?? 10)));
}

export async function searchVirtualPairingDogs(
  input: VirtualPairingSearchRequest,
  context?: DogsServiceLogContext,
): Promise<ServiceResult<VirtualPairingSearchResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "dogs.searchVirtualPairingDogs",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  log.info(
    {
      event: "start",
      field: input.field,
      query: input.query,
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 10,
    },
    "virtual pairing search started",
  );

  try {
    const result = await searchVirtualPairingDogsDb({
      field: input.field,
      query: input.query,
      page: parsePage(input.page),
      pageSize: parsePageSize(input.pageSize),
    });

    log.info(
      {
        event: "success",
        total: result.total,
        itemCount: result.items.length,
        durationMs: Date.now() - startedAt,
      },
      "virtual pairing search succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          field: result.field,
          query: result.query,
          total: result.total,
          totalPages: result.totalPages,
          page: result.page,
          isLimited: result.isLimited,
          candidateLimit: result.candidateLimit,
          items: result.items,
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
      "virtual pairing search failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load virtual pairing search results.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
