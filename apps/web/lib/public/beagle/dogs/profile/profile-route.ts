const DOG_PROFILE_ROUTE_ROOT = "/beagle/dogs";

export function getDogProfileHref(dogId: string): string {
  return `${DOG_PROFILE_ROUTE_ROOT}/${encodeURIComponent(dogId)}`;
}
