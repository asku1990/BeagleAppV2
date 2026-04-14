import type {
  AdminTrialDetailsRequest,
  AdminTrialSearchRequest,
} from "@beagle/contracts";
import type { ClientOptions } from "@api-client/core/client-options";
import { createRequest } from "@api-client/core/request";
import { getAdminTrial } from "./get-admin-trial";
import { listAdminTrials } from "./list-admin-trials";

export function createAdminTrialsApiClient(options: ClientOptions = {}) {
  const request = createRequest(options);

  return {
    getAdminTrial(input: AdminTrialDetailsRequest) {
      return getAdminTrial(request, input);
    },

    listAdminTrials(input: AdminTrialSearchRequest = {}) {
      return listAdminTrials(request, input);
    },
  };
}
