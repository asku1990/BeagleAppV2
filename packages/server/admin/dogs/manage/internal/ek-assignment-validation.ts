// Enforces the relationship between a dog's EK number and its assignment date.
export function isValidEkAssignment(
  ekNo: number | null,
  ekNoAssignedOn: Date | null,
): boolean {
  return ekNoAssignedOn === null || ekNo !== null;
}
