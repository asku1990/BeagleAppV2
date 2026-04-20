const BEAGLE_TRIALS_ROUTE_ROOT = "/beagle/trials";

export function getBeagleTrialHref(trialId: string): string {
  return `${BEAGLE_TRIALS_ROUTE_ROOT}/${encodeURIComponent(trialId)}`;
}

export function getBeagleTrialPdfHref(trialId: string): string {
  return `${getBeagleTrialHref(trialId)}/pdf`;
}
