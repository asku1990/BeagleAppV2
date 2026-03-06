const BEAGLE_TRIALS_ROUTE_ROOT = "/beagle/trials";

export function getBeagleTrialHref(trialId: string): string {
  return `${BEAGLE_TRIALS_ROUTE_ROOT}/${encodeURIComponent(trialId)}`;
}
