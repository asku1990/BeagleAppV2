const DOG_PROFILE_ROUTE_ROOT = "/beagle/dogs";

export function getDogProfileHref(dogId: string): string {
  return `${DOG_PROFILE_ROUTE_ROOT}/${encodeURIComponent(dogId)}`;
}

export function getDogTrialsLaajaHref(dogId: string): string {
  return `${getDogProfileHref(dogId)}/kokeet-laaja`;
}
