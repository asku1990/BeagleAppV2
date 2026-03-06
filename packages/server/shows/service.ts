import type {
  BeagleShowDetailsResponse,
  BeagleShowSearchRequest,
  BeagleShowSearchResponse,
} from "@beagle/contracts";
import type { ServiceResult } from "../core/result";
import { getBeagleShowDetailsService } from "./get-beagle-show-details";
import { searchBeagleShowsService } from "./search-beagle-shows";
import type { ShowsServiceLogContext } from "./types";

export function createShowsService() {
  return {
    async searchBeagleShows(
      input: BeagleShowSearchRequest,
      context?: ShowsServiceLogContext,
    ): Promise<ServiceResult<BeagleShowSearchResponse>> {
      return searchBeagleShowsService(input, context);
    },

    async getBeagleShowDetails(
      showId: string,
      context?: ShowsServiceLogContext,
    ): Promise<ServiceResult<BeagleShowDetailsResponse>> {
      return getBeagleShowDetailsService(showId, context);
    },
  };
}

export const showsService = createShowsService();
