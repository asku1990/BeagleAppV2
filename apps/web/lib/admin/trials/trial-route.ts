const ADMIN_TRIALS_ROUTE_ROOT = "/admin/trials";

export function getAdminTrialsHref(): string {
  return ADMIN_TRIALS_ROUTE_ROOT;
}

export function getAdminTrialEventHref(trialEventId: string): string {
  return `${ADMIN_TRIALS_ROUTE_ROOT}/${encodeURIComponent(trialEventId)}`;
}
