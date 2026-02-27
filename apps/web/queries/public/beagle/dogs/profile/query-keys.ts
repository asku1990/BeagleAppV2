export const beagleDogsQueryKeyRoot = ["beagle", "dogs"] as const;

export function beagleDogProfileQueryKey(dogId: string) {
  return [...beagleDogsQueryKeyRoot, "profile", dogId] as const;
}
