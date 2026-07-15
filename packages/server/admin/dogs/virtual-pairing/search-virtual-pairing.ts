import type {
  CurrentUserDto,
  VirtualPairingSearchRequest,
  VirtualPairingSearchResponse,
} from "@beagle/contracts";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { searchVirtualPairingDogs } from "@server/dogs/virtual-pairing";

type SearchResult = ServiceResult<VirtualPairingSearchResponse>;

export async function searchAdminVirtualPairing(
  input: VirtualPairingSearchRequest,
  currentUser: CurrentUserDto | null,
): Promise<SearchResult> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-dogs.searchAdminVirtualPairing",
    ...(currentUser?.id ? { actorUserId: currentUser.id } : {}),
  });

  log.info(
    {
      event: "start",
      field: input.field,
      query: input.query,
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 10,
    },
    "admin virtual pairing search started",
  );

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin virtual pairing search rejected by authorization",
    );

    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  try {
    const result = await searchVirtualPairingDogs(input, {
      context: {
        actorUserId: currentUser?.id ?? undefined,
      },
    });

    if (!result.body.ok) {
      return result;
    }

    log.info(
      {
        event: "success",
        total: result.body.data.total,
        itemCount: result.body.data.items.length,
        durationMs: Date.now() - startedAt,
      },
      "admin virtual pairing search succeeded",
    );

    return result;
  } catch (error) {
    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin virtual pairing search failed",
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
