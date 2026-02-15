"use server";

import type {
  BeagleSearchRequest,
  BeagleSearchResponse,
} from "@beagle/contracts";
import { dogsService } from "@beagle/server";

export type SearchDogsActionResult = {
  data: BeagleSearchResponse | null;
  hasError: boolean;
  error?: string;
};

export async function searchDogsAction(
  input: BeagleSearchRequest,
): Promise<SearchDogsActionResult> {
  const result = await dogsService.searchBeagleDogs(input);
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
