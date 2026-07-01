const TRIALS_API_ROUTE_ROOT = "/api/trials";
const TRIALS_PUBLIC_ROUTE_ROOT = "/beagle/trials";

export function getTrialPdfApiHref(trialEntryId: string): string {
  return `${TRIALS_API_ROUTE_ROOT}/${encodeURIComponent(trialEntryId)}/pdf`;
}

export function getTrialPdfPageHref(trialEntryIds: string | string[]): string {
  const ids = Array.isArray(trialEntryIds) ? trialEntryIds : [trialEntryIds];
  const params = new URLSearchParams();

  for (const trialEntryId of ids) {
    params.append("trialEntryId", trialEntryId);
  }

  return `${TRIALS_PUBLIC_ROUTE_ROOT}/pdf?${params.toString()}`;
}
