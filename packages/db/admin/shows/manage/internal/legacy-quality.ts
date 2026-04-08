export const LEGACY_QUALITY_MIN = 1;
export const LEGACY_QUALITY_MAX = 6;

export function isLegacyQualityValue(value: number): boolean {
  return value >= LEGACY_QUALITY_MIN && value <= LEGACY_QUALITY_MAX;
}
