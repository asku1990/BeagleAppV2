export function buildTrialEntryIdentity(
  sklKoeId: number,
  canonicalRegistrationNo: string,
): string {
  return `SKL:${sklKoeId}|REG:${canonicalRegistrationNo}`;
}
