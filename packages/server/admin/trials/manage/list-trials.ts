import type {
  AdminTrialEventSearchRequest,
  AdminTrialEventSearchResponse,
  CurrentUserDto,
} from "@beagle/contracts";
import { requireAdmin } from "@server/admin/core/service";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { mapAdminTrialEventSearchResponse } from "./internal/map-admin-trial-event-search-response";
import { parseAdminTrialEventSearchInput } from "./internal/parse-admin-trial-event-search-input";
import { resolveAdminTrialEventSearchResponseDb } from "./internal/resolve-admin-trial-event-defaults";

type ServiceLogContext = {
  requestId?: string;
  actorUserId?: string;
};

export async function listAdminTrialEvents(
  input: AdminTrialEventSearchRequest,
  currentUser: CurrentUserDto | null,
  context?: ServiceLogContext,
): Promise<ServiceResult<AdminTrialEventSearchResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "admin-trials.listAdminTrialEvents",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
    ...(context?.actorUserId ? { actorUserId: context.actorUserId } : {}),
  });

  const authResult = requireAdmin(currentUser);
  if (!authResult.body.ok) {
    log.warn(
      {
        event: "forbidden",
        status: authResult.status,
        durationMs: Date.now() - startedAt,
      },
      "admin trial events list rejected by authorization",
    );

    return {
      status: authResult.status,
      body: authResult.body,
    };
  }

  const parsedResult = parseAdminTrialEventSearchInput(input);
  if (!parsedResult.ok) {
    return parsedResult.error;
  }

  const parsedInput = parsedResult.value;

  log.info(
    {
      event: "start",
      query: parsedInput.query,
      page: parsedInput.page,
      pageSize: parsedInput.pageSize,
      sort: parsedInput.sort,
      year: parsedInput.year,
      dateFrom: parsedInput.dateFromIso,
      dateTo: parsedInput.dateToIso,
    },
    "admin trial events list started",
  );

  try {
    const result = await resolveAdminTrialEventSearchResponseDb(parsedInput);
    const data = mapAdminTrialEventSearchResponse(parsedInput, result);

    log.info(
      {
        event: "success",
        mode: data.filters.mode,
        total: data.total,
        itemCount: data.items.length,
        durationMs: Date.now() - startedAt,
      },
      "admin trial events list succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data,
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "admin trial events list failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin trial events.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
