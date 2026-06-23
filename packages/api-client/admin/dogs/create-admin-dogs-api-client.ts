import type { ClientOptions } from "@api-client/core/client-options";
import { createRequest } from "@api-client/core/request";
import { getAdminDogProfile } from "@api-client/admin/dogs/get-admin-dog-profile";
import { listAdminDogColorOptions as listAdminDogColorOptionsRequest } from "@api-client/admin/dogs/list-admin-dog-color-options";
import { listAdminDogDiseases as listAdminDogDiseasesRequest } from "@api-client/admin/dogs/list-admin-dog-diseases";
import type {
  AdminDogDiseaseBrowseRequest,
  AdminDogProfileRequest,
} from "@beagle/contracts";

export function createAdminDogsApiClient(options: ClientOptions = {}) {
  const request = createRequest(options);

  return {
    getAdminDogProfile(input: AdminDogProfileRequest) {
      return getAdminDogProfile(request, input);
    },

    listAdminDogColorOptions() {
      return listAdminDogColorOptionsRequest(request);
    },

    listAdminDogDiseases(input: AdminDogDiseaseBrowseRequest = {}) {
      return listAdminDogDiseasesRequest(request, input);
    },
  };
}
