import type { DogColorDto } from "@beagle/contracts";

export function formatDogColor(
  color: DogColorDto | null,
  locale: "fi" | "sv",
): string | null {
  if (!color) {
    return null;
  }

  const name =
    locale === "sv"
      ? (color.nameSv ?? color.nameFi ?? color.nameEn)
      : (color.nameFi ?? color.nameSv ?? color.nameEn);

  if (color.status === "LEGACY_UNKNOWN") {
    return `${name ?? String(color.code)} (${color.code})`;
  }

  return name ?? String(color.code);
}
