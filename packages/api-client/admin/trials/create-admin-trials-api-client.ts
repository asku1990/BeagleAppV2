import type { AdminTrialSearchRequest } from "@beagle/contracts";
import type { ClientOptions } from "../../core/client-options";
import { createRequest } from "../../core/request";
import { listAdminTrials } from "./list-admin-trials";

export function createAdminTrialsApiClient(options: ClientOptions = {}) {
  const request = createRequest(options);

  return {
    listAdminTrials(input: AdminTrialSearchRequest = {}) {
      return listAdminTrials(request, input);
    },
  };
}
