const BEAGLE_SHOWS_ROUTE_ROOT = "/beagle/shows";

export function getBeagleShowsListHref(): string {
  return BEAGLE_SHOWS_ROUTE_ROOT;
}

export function getBeagleShowHref(showId: string): string {
  return `${BEAGLE_SHOWS_ROUTE_ROOT}/${encodeURIComponent(showId)}`;
}
