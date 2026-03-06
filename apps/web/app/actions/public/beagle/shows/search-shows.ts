"use server";

import type {
  BeagleShowSearchRequest,
  BeagleShowSearchResponse,
} from "@beagle/contracts";
import { showsService, toErrorLog } from "@beagle/server";
import { createActionLogger } from "@/lib/server/action-logger";

export type SearchBeagleShowsActionResult = {
  data: BeagleShowSearchResponse | null;
  hasError: boolean;
  status: number;
  error?: string;
};

function normalizeYearForLog(value: number | undefined): number | undefined {
  if (!Number.isFinite(value)) {
    return undefined;
  }
  return Math.trunc(value as number);
}

function normalizeDateForLog(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function normalizePageForLog(
  value: number | undefined,
  fallback: number,
): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.trunc(value as number);
}

export async function searchBeagleShowsAction(
  input: BeagleShowSearchRequest = {},
): Promise<SearchBeagleShowsActionResult> {
  const startedAt = Date.now();
  const { log, requestId } = await createActionLogger({
    action: "searchBeagleShowsAction",
  });
  log.info(
    {
      event: "start",
      year: normalizeYearForLog(input.year),
      dateFrom: normalizeDateForLog(input.dateFrom),
      dateTo: normalizeDateForLog(input.dateTo),
      page: normalizePageForLog(input.page, 1),
      pageSize: normalizePageForLog(input.pageSize, 10),
      sort: input.sort ?? "date-desc",
    },
    "search beagle shows action started",
  );

  try {
    const result = await showsService.searchBeagleShows(input, { requestId });
    if (!result.body.ok) {
      log.warn(
        {
          event: "failure",
          status: result.status,
          durationMs: Date.now() - startedAt,
        },
        "search beagle shows action failed",
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
        total: result.body.data.total,
        itemCount: result.body.data.items.length,
        durationMs: Date.now() - startedAt,
      },
      "search beagle shows action succeeded",
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
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "search beagle shows action threw",
    );
    return {
      data: null,
      hasError: true,
      status: 500,
      error: "Failed to load beagle shows.",
    };
  }
}
