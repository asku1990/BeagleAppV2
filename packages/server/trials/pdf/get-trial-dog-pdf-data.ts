import type { TrialDogPdfData as TrialDogPdfDataContract } from "@contracts";
import { getTrialDogPdfDataDb } from "@db/trials/pdf";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";

export type TrialDogPdfData = TrialDogPdfDataContract & {
  trialId: string;
};

function normalizeTrialId(value: string): string {
  return value.trim();
}

export async function getTrialDogPdfDataService(
  trialId: string,
  context?: { requestId?: string },
): Promise<ServiceResult<TrialDogPdfData>> {
  const startedAt = Date.now();
  const normalizedTrialId = normalizeTrialId(trialId);
  const log = withLogContext({
    layer: "service",
    useCase: "trials.getTrialDogPdfData",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
  });

  if (!normalizedTrialId) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid trial id.",
        code: "INVALID_TRIAL_ID",
      },
    };
  }

  try {
    const result = await getTrialDogPdfDataDb({
      trialId: normalizedTrialId,
    });

    if (!result) {
      return {
        status: 404,
        body: {
          ok: false,
          error: "Trial not found.",
          code: "TRIAL_NOT_FOUND",
        },
      };
    }

    log.info(
      {
        event: "success",
        trialId: normalizedTrialId,
        hasRegistrationNo: Boolean(result.registrationNo),
        durationMs: Date.now() - startedAt,
      },
      "trial dog pdf data fetch succeeded",
    );

    return {
      status: 200,
      body: {
        ok: true,
        data: {
          trialId: result.trialId,
          registrationNo: result.registrationNo,
          dogName: result.dogName,
          dogSex: result.dogSex,
          sireName: result.sireName,
          sireRegistrationNo: result.sireRegistrationNo,
          damName: result.damName,
          damRegistrationNo: result.damRegistrationNo,
          omistaja: result.omistaja,
          omistajanKotikunta: result.omistajanKotikunta,
          kennelpiiri: result.kennelpiiri,
          kennelpiirinro: result.kennelpiirinro,
          koekunta: result.koekunta,
          koepaiva: result.koepaiva,
          jarjestaja: result.jarjestaja,
          era1Alkoi: result.era1Alkoi,
          era2Alkoi: result.era2Alkoi,
          hakuMin1: result.hakuMin1,
          hakuMin2: result.hakuMin2,
          ajoMin1: result.ajoMin1,
          ajoMin2: result.ajoMin2,
          hyvaksytytAjominuutit: result.hyvaksytytAjominuutit,
          ajoajanPisteet: result.ajoajanPisteet,
          hakuEra1: result.hakuEra1,
          hakuEra2: result.hakuEra2,
          hakuKeskiarvo: result.hakuKeskiarvo,
          haukkuEra1: result.haukkuEra1,
          haukkuEra2: result.haukkuEra2,
          haukkuKeskiarvo: result.haukkuKeskiarvo,
          ajotaitoEra1: result.ajotaitoEra1,
          ajotaitoEra2: result.ajotaitoEra2,
        },
      },
    };
  } catch (error) {
    log.error(
      {
        event: "exception",
        trialId: normalizedTrialId,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "trial dog pdf data fetch failed",
    );

    return {
      status: 500,
      body: {
        ok: false,
        error: "Failed to load trial dog pdf data.",
        code: "INTERNAL_ERROR",
      },
    };
  }
}
