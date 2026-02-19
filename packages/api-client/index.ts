import type { ImportIssueSeverity } from "@beagle/contracts";
import type { ClientOptions } from "./core/client-options";
import { createRequest } from "./core/request";
import { getImportRun } from "./imports/get-import-run";
import { getImportRunIssues } from "./imports/get-import-run-issues";

export function createApiClient(options: ClientOptions = {}) {
  const request = createRequest(options);

  return {
    getImportRun(id: string) {
      return getImportRun(request, id);
    },

    getImportRunIssues(
      id: string,
      options?: {
        stage?: string;
        code?: string;
        severity?: ImportIssueSeverity;
        cursor?: string;
        limit?: number;
      },
    ) {
      return getImportRunIssues(request, id, options);
    },
  };
}
