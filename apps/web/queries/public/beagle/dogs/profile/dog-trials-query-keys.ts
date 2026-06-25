const beagleDogsQueryKeyRoot = ["beagle", "dogs"] as const;

export function beagleDogTrialsQueryKey(dogId: string) {
  return [...beagleDogsQueryKeyRoot, "profile", "trials", dogId] as const;
}
