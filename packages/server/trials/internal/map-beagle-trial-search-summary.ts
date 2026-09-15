// Maps filtered trial-search counts into values ready for public rendering.
import type { BeagleTrialSearchSummary } from "@beagle/contracts";
import type { BeagleTrialSearchSummaryDb } from "@beagle/db";

export function mapBeagleTrialSearchSummary(
  source: BeagleTrialSearchSummaryDb,
): BeagleTrialSearchSummary {
  const value = (count: number) => ({
    count,
    percentage: source.entryCount === 0 ? 0 : (count / source.entryCount) * 100,
  });

  return {
    trialCount: source.trialCount,
    entryCount: source.entryCount,
    awarded: value(source.awarded),
    first: value(source.first),
    second: value(source.second),
    third: value(source.third),
    noPrize: value(source.noPrize),
    withdrew: value(source.withdrew),
    excluded: value(source.excluded),
  };
}
