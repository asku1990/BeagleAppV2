import type {
  AdminShowDetailsRequest,
  AdminShowSearchRequest,
} from "@beagle/contracts";
import type { ClientOptions } from "@api-client/core/client-options";
import { createRequest } from "@api-client/core/request";
import { getAdminShowEvent } from "@api-client/admin/shows/get-admin-show-event";
import { listAdminShowEvents } from "@api-client/admin/shows/list-admin-show-events";

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
