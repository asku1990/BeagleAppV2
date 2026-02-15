"use server";

import type {
  BeagleNewestRequest,
  BeagleNewestResponse,
} from "@beagle/contracts";
import { dogsService } from "@beagle/server";

export type GetNewestDogsActionResult = {
  data: BeagleNewestResponse | null;
  hasError: boolean;
  error?: string;
};

export async function getNewestDogsAction(
  input: BeagleNewestRequest = {},
): Promise<GetNewestDogsActionResult> {
  const result = await dogsService.getNewestBeagleDogs(input);
  if (!result.body.ok) {
    return {
      data: null,
      hasError: true,
      error: result.body.error,
    };
  }

  return {
    data: result.body.data,
    hasError: false,
  };
}
