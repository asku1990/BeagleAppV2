import type {
  AdminTrialDetailsRequest,
  AdminTrialEventDetailsRequest,
  AdminTrialEventSearchRequest,
} from "@beagle/contracts";
import type { ClientOptions } from "@api-client/core/client-options";
import { createRequest } from "@api-client/core/request";
import { getAdminTrial } from "./get-admin-trial";
import { getAdminTrialEvent } from "./get-admin-trial-event";
import { listAdminTrials } from "./list-admin-trials";

export function createAdminTrialsApiClient(options: ClientOptions = {}) {
  const request = createRequest(options);

  return {
    getAdminTrial(input: AdminTrialDetailsRequest) {
      return getAdminTrial(request, input);
    },

    getAdminTrialEvent(input: AdminTrialEventDetailsRequest) {
      return getAdminTrialEvent(request, input);
    },

    listAdminTrials(input: AdminTrialEventSearchRequest = {}) {
      return listAdminTrials(request, input);
    },
  };
}
