export const adminDogProfileQueryKeyRoot = ["admin-dogs", "profile"] as const;

export function adminDogProfileQueryKey(dogId: string) {
  return [...adminDogProfileQueryKeyRoot, dogId] as const;
}
