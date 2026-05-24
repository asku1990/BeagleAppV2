export const VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH = 9;
export const VIRTUAL_PAIRING_MIN_GENERATION_DEPTH = 4;
export const VIRTUAL_PAIRING_MAX_GENERATION_DEPTH = 12;

// Normalizes the legacy virtual-pairing generation depth selector.
export function parseVirtualPairingGenerationDepth(
  value: number | null | undefined,
): number {
  if (!Number.isFinite(value)) {
    return VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH;
  }

  const parsed = Math.floor(value ?? VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH);
  return Math.min(
    VIRTUAL_PAIRING_MAX_GENERATION_DEPTH,
    Math.max(VIRTUAL_PAIRING_MIN_GENERATION_DEPTH, parsed),
  );
}
