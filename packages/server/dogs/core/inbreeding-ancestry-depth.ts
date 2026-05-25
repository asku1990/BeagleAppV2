export const INBREEDING_DEFAULT_ANCESTOR_FA_DEPTH = 9;

// Determines how far parent ancestry must be loaded so shared ancestors near
// the selected pair depth still have enough pedigree data for their own
// default 9-generation dynamic Fa. The selected SP limits pair occurrence
// discovery; ancestor Fa intentionally stays fixed for v1 parity.
export function getInbreedingAncestryLoadDepth(
  maxDepth: number,
  ancestorInbreedingDepth = INBREEDING_DEFAULT_ANCESTOR_FA_DEPTH,
): number {
  return Math.max(0, maxDepth + ancestorInbreedingDepth - 1);
}
