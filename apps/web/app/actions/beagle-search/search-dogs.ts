"use server";

import type {
  BeagleSearchRequest,
  BeagleSearchResponse,
} from "@beagle/contracts";
import { dogsService, toErrorLog } from "@beagle/server";
import { createActionLogger } from "@/lib/server/action-logger";

export type SearchDogsActionResult = {
  data: BeagleSearchResponse | null;
  hasError: boolean;
  error?: string;
};

export async function searchDogsAction(
  input: BeagleSearchRequest,
): Promise<SearchDogsActionResult> {
  const startedAt = Date.now();
  const { log, requestId } = await createActionLogger({
    action: "searchDogsAction",
  });
  log.info(
    {
      event: "start",
      sort: input.sort ?? "name-asc",
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 10,
    },
    "search dogs action started",
  );

  try {
    const result = await dogsService.searchBeagleDogs(input, { requestId });
    if (!result.body.ok) {
      log.warn(
        {
          event: "failure",
          status: result.status,
          durationMs: Date.now() - startedAt,
        },
        "search dogs action failed",
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
        total: result.body.data.total,
        itemCount: result.body.data.items.length,
        durationMs: Date.now() - startedAt,
      },
      "search dogs action succeeded",
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
      "search dogs action threw",
    );
    throw error;
  }
}
