import type {
  ApiResult,
  ImportIssueSeverity,
  VirtualPairingSearchRequest,
  VirtualPairingSearchResponse,
} from "@beagle/contracts";
import type { ClientOptions } from "./core/client-options";
import { createRequest } from "./core/request";
import { getImportRun } from "./imports/get-import-run";
import { getImportRunIssues } from "./imports/get-import-run-issues";
import { searchPublicVirtualPairing } from "./public/dogs/search-public-virtual-pairing";

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

    searchPublicVirtualPairing(
      input: VirtualPairingSearchRequest,
    ): Promise<ApiResult<VirtualPairingSearchResponse>> {
      return searchPublicVirtualPairing(request, input);
    },
  };
}
