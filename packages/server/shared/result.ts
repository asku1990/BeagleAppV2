import type { ApiResult } from "@beagle/contracts";

export type ServiceResult<T> = {
  status: number;
  body: ApiResult<T>;
};
