import type {
  BeagleTrialDetailsResponse,
  BeagleTrialSearchRequest,
  BeagleTrialSearchResponse,
  KoiratietokantaAjokUpsertResponse,
} from "@beagle/contracts";
import type { ServiceResult } from "../core/result";
import { getBeagleTrialDetailsService } from "./get-beagle-trial-details";
import { upsertKoiratietokantaAjokResultService } from "./integrations";
import { searchBeagleTrialsService } from "./search-beagle-trials";
import type { TrialsServiceLogContext } from "./types";

export function createTrialsService() {
  return {
    async searchBeagleTrials(
      input: BeagleTrialSearchRequest,
      context?: TrialsServiceLogContext,
    ): Promise<ServiceResult<BeagleTrialSearchResponse>> {
      return searchBeagleTrialsService(input, context);
    },

    async getBeagleTrialDetails(
      trialId: string,
      context?: TrialsServiceLogContext,
    ): Promise<ServiceResult<BeagleTrialDetailsResponse>> {
      return getBeagleTrialDetailsService(trialId, context);
    },

    async upsertKoiratietokantaAjokResult(
      payload: Record<string, unknown>,
    ): Promise<ServiceResult<KoiratietokantaAjokUpsertResponse>> {
      return upsertKoiratietokantaAjokResultService(payload);
    },
  };
}

export const trialsService = createTrialsService();
