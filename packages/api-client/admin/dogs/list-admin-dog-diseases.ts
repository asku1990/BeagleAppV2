import type {
  AdminDogDiseaseBrowseRequest,
  AdminDogDiseaseBrowseResponse,
} from "@beagle/contracts";
import type { RequestFn } from "@api-client/core/request";

function toQueryString(input: AdminDogDiseaseBrowseRequest) {
  const params = new URLSearchParams();
  if (input.diseaseCode === null) {
    params.set("diseaseCode", "all");
  } else if (typeof input.diseaseCode === "string") {
    params.set("diseaseCode", input.diseaseCode);
  }
  if (typeof input.page === "number") params.set("page", String(input.page));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function listAdminDogDiseases(
  request: RequestFn,
  input: AdminDogDiseaseBrowseRequest = {},
) {
  return request<AdminDogDiseaseBrowseResponse>(
    `/api/admin/dogs/diseases${toQueryString(input)}`,
    {
      method: "GET",
    },
  );
}
