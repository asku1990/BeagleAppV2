import type { DogProfileSeed, DogProfileSex } from "./types";

const DOG_PROFILE_ROUTE_ROOT = "/beagle/dogs";

type DogProfileRouteSeed = Partial<DogProfileSeed> & {
  sex?: DogProfileSex;
};

function toPositiveInteger(value: number | undefined): number | null {
  if (!Number.isFinite(value)) {
    return null;
  }

  return Math.max(0, Math.floor(value ?? 0));
}

export function getDogProfileHref(
  dogId: string,
  seed?: DogProfileRouteSeed,
): string {
  const basePath = `${DOG_PROFILE_ROUTE_ROOT}/${encodeURIComponent(dogId)}`;
  if (!seed) {
    return basePath;
  }

  const params = new URLSearchParams();
  if (seed.registrationNo?.trim()) {
    params.set("reg", seed.registrationNo.trim());
  }
  if (seed.name?.trim()) {
    params.set("name", seed.name.trim());
  }
  if (seed.sex === "U" || seed.sex === "N") {
    params.set("sex", seed.sex);
  }
  if (seed.ekNo != null) {
    params.set("ek", String(seed.ekNo));
  }

  const showCount = toPositiveInteger(seed.showCount);
  if (showCount != null) {
    params.set("shows", String(showCount));
  }

  const trialCount = toPositiveInteger(seed.trialCount);
  if (trialCount != null) {
    params.set("trials", String(trialCount));
  }

  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}
