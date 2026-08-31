// Calculates a Paras ajuri season from canonical trial entries and maps it to the public contract.
import { getBestDriverSourceDb, type BestDriverCandidateDb } from "@beagle/db";
import type {
  BestDriverRankingRequest,
  BestDriverRankingResponse,
  BestDriverRankingRow,
} from "@beagle/contracts";
import { toErrorLog, withLogContext } from "@server/core/logger";
import type { ServiceResult } from "@server/core/result";
import { formatTrialDateOnly } from "@server/trials/core/date-only";
import type { CompetitionsServiceLogContext } from "../types";
import {
  collectBestDriverSeasons,
  getBestDriverSeasonRange,
  getCurrentBestDriverSeason,
  parseBestDriverSeason,
} from "./internal/season";
import {
  getBestDriverTotalPoints,
  selectBestDriverResults,
} from "./internal/select-best-results";

function mapSex(value: BestDriverCandidateDb["dogSex"]): "U" | "N" | "-" {
  if (value === "MALE") return "U";
  if (value === "FEMALE") return "N";
  return "-";
}

function groupByDog(candidates: BestDriverCandidateDb[]) {
  const groups = new Map<string, BestDriverCandidateDb[]>();
  for (const candidate of candidates) {
    const existing = groups.get(candidate.dogId);
    if (existing) existing.push(candidate);
    else groups.set(candidate.dogId, [candidate]);
  }
  return groups;
}

export async function getBestDriverRankingService(
  input: BestDriverRankingRequest,
  context?: CompetitionsServiceLogContext,
): Promise<ServiceResult<BestDriverRankingResponse>> {
  const startedAt = Date.now();
  const log = withLogContext({
    layer: "service",
    useCase: "competitions.bestDriver.getRanking",
    ...(context?.requestId ? { requestId: context.requestId } : {}),
  });
  const parsedSeason = parseBestDriverSeason(input.season);
  if (Number.isNaN(parsedSeason)) {
    log.warn(
      { event: "invalid_season", season: input.season },
      "best driver ranking rejected",
    );
    return { status: 400, body: { ok: false, error: "Invalid season value." } };
  }

  const currentSeason = getCurrentBestDriverSeason();
  const season = parsedSeason ?? currentSeason;
  const range = getBestDriverSeasonRange(season);

  try {
    const source = await getBestDriverSourceDb(range);
    const ranking = [...groupByDog(source.candidates).values()]
      .flatMap((candidates) => {
        const selected = selectBestDriverResults(candidates);
        if (!selected) return [];
        const identity = selected[0]!;
        return [
          {
            dogId: identity.dogId,
            dogName: identity.dogName,
            registrationNo: identity.registrationNo,
            sex: mapSex(identity.dogSex),
            totalPoints: getBestDriverTotalPoints(selected),
            results: selected.map((result) => ({
              trialEntryId: result.trialEntryId,
              trialEventId: result.trialEventId,
              eventDate: formatTrialDateOnly(result.eventDate),
              eventPlace: result.eventPlace,
              kennelDistrict: result.kennelDistrict,
              kennelDistrictNo: result.kennelDistrictNo,
              weather: result.weather,
              trialType: result.trialType,
              placement: result.placement,
              points: result.points,
            })),
          },
        ];
      })
      .sort(
        (left, right) =>
          right.totalPoints - left.totalPoints ||
          left.dogName.localeCompare(right.dogName, "fi", {
            sensitivity: "base",
          }) ||
          left.registrationNo.localeCompare(right.registrationNo, "fi", {
            sensitivity: "base",
          }),
      );

    const items: BestDriverRankingRow[] = ranking.map((row, index) => ({
      position: index + 1,
      ...row,
    }));
    const data: BestDriverRankingResponse = {
      season,
      availableSeasons: [
        ...new Set([
          season,
          ...collectBestDriverSeasons(
            source.availableEventDates,
            currentSeason,
          ),
        ]),
      ].sort((left, right) => right - left),
      items,
    };
    log.info(
      {
        event: "success",
        season,
        itemCount: items.length,
        durationMs: Date.now() - startedAt,
      },
      "best driver ranking succeeded",
    );
    return { status: 200, body: { ok: true, data } };
  } catch (error) {
    log.error(
      {
        event: "exception",
        season,
        durationMs: Date.now() - startedAt,
        ...toErrorLog(error),
      },
      "best driver ranking failed",
    );
    return {
      status: 500,
      body: { ok: false, error: "Failed to load best driver ranking." },
    };
  }
}
