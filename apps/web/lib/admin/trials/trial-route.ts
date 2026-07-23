const ADMIN_TRIALS_ROUTE_ROOT = "/admin/trials";

export function getAdminTrialsHref(): string {
  return ADMIN_TRIALS_ROUTE_ROOT;
}

export function getAdminTrialEventCreateHref(): string {
  return `${ADMIN_TRIALS_ROUTE_ROOT}/new`;
}

export function getAdminTrialEventHref(trialEventId: string): string {
  return `${ADMIN_TRIALS_ROUTE_ROOT}/${encodeURIComponent(trialEventId)}`;
}

export function getAdminTrialEntryCreateHref(trialEventId: string): string {
  return `${getAdminTrialEventHref(trialEventId)}/results/new`;
}
