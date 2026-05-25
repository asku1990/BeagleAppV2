// Determines how far parent ancestry must be loaded so shared ancestors near
// the selected depth still have enough pedigree data for their own dynamic Fa.
export function getInbreedingAncestryLoadDepth(maxDepth: number): number {
  return Math.max(0, maxDepth * 2 - 1);
}
