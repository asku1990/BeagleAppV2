export function normalizeShowResult(
  result: string | null,
  eventDateIsoDate: string,
): string | null {
  if (!result) {
    return null;
  }

  const trimmed = result.trim();
  if (!trimmed) {
    return null;
  }

  // Legacy rule (nay.php):
  // Convert old show codes (e.g. JUN1 -> JUN-ERI) only for dates >= 2003-01-01.
  if (eventDateIsoDate < "2003-01-01") {
    return trimmed;
  }

  const normalizedLegacyGrades = trimmed
    .replace(/\bVAKL\b/gi, "VAK")
    .replace(/\b(JUN|NUO|AVO|VAL|VET)([1-6])\b/gi, (_, cls, grade) => {
      const awards = ["ERI", "EH", "H", "T", "EVA", "HYL"] as const;
      const idx = Number(grade) - 1;
      const suffix = awards[idx] ?? grade;
      return `${String(cls).toUpperCase()}-${suffix}`;
    })
    .replace(/\b(KÄY|KAY)([1-6])\b/gi, (_, cls, grade) => {
      const awards = ["ERI", "EH", "H", "T", "EVA", "HYL"] as const;
      const idx = Number(grade) - 1;
      const suffix = awards[idx] ?? grade;
      return `${String(cls).toUpperCase()}-${suffix}`;
    });

  return normalizedLegacyGrades;
}
