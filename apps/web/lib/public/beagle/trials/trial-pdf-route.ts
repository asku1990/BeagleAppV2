const TRIALS_API_ROUTE_ROOT = "/api/trials";
const TRIALS_PUBLIC_ROUTE_ROOT = "/beagle/trials";

export function getTrialPdfHref(trialId: string): string {
  return getTrialPdfApiHref(trialId);
}

export function getTrialPdfApiHref(trialId: string): string {
  return `${TRIALS_API_ROUTE_ROOT}/${encodeURIComponent(trialId)}/pdf`;
}

export function getTrialPdfPageHref(trialId: string): string {
  return `${TRIALS_PUBLIC_ROUTE_ROOT}/${encodeURIComponent(trialId)}/pdf`;
}
