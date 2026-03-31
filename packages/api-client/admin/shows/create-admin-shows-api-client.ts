import type {
  AdminShowDetailsRequest,
  AdminShowSearchRequest,
} from "@beagle/contracts";
import type { ClientOptions } from "../../core/client-options";
import { createRequest } from "../../core/request";
import { getAdminShowEvent } from "./get-admin-show-event";
import { listAdminShowEvents } from "./list-admin-show-events";

export function createAdminShowsApiClient(options: ClientOptions = {}) {
  const request = createRequest(options);

  return {
    getAdminShowEvent(input: AdminShowDetailsRequest) {
      return getAdminShowEvent(request, input);
    },

    listAdminShowEvents(input: AdminShowSearchRequest = {}) {
      return listAdminShowEvents(request, input);
    },
  };
}
