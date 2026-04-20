const TRIALS_API_ROUTE_ROOT = "/api/trials";

export function getTrialPdfHref(trialId: string): string {
  return `${TRIALS_API_ROUTE_ROOT}/${encodeURIComponent(trialId)}/pdf`;
}
