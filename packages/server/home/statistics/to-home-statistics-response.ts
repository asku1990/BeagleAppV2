import type { HomeStatisticsResponse } from "@beagle/contracts";
import type { HomeStatisticsSnapshot } from "@beagle/db";

function toIsoOrNull(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export function toHomeStatisticsResponse(
  snapshot: HomeStatisticsSnapshot,
): HomeStatisticsResponse {
  return {
    registrations: {
      registeredDogs: snapshot.registrations.registeredDogs,
      youngestRegisteredBirthDate: toIsoOrNull(
        snapshot.registrations.youngestRegisteredBirthDate,
      ),
    },
    trials: {
      resultsPeriodStart: toIsoOrNull(snapshot.trials.resultsPeriodStart),
      resultsPeriodEnd: toIsoOrNull(snapshot.trials.resultsPeriodEnd),
      totalEntries: snapshot.trials.totalEntries,
      performedByDogs: snapshot.trials.performedByDogs,
    },
    shows: {
      resultsPeriodStart: toIsoOrNull(snapshot.shows.resultsPeriodStart),
      resultsPeriodEnd: toIsoOrNull(snapshot.shows.resultsPeriodEnd),
      totalEntries: snapshot.shows.totalEntries,
      performedByDogs: snapshot.shows.performedByDogs,
    },
    generatedAt: snapshot.generatedAt.toISOString(),
  };
}
