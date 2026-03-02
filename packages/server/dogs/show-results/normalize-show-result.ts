const SHOW_GRADE_AWARDS = ["ERI", "EH", "H", "T", "EVA", "HYL"] as const;

function replaceLegacyClassGrades(input: string, classPattern: string): string {
  return input.replace(
    new RegExp(`\\b(${classPattern})([1-6])\\b`, "gi"),
    (_, cls, grade) => {
      const idx = Number(grade) - 1;
      const suffix = SHOW_GRADE_AWARDS[idx] ?? grade;
      return `${String(cls).toUpperCase()}-${suffix}`;
    },
  );
}

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

  const normalizedVak = trimmed.replace(/\bVAKL\b/gi, "VAK");
  const normalizedMainClasses = replaceLegacyClassGrades(
    normalizedVak,
    "JUN|NUO|AVO|VAL|VET",
  );
  const normalizedLegacyGrades = replaceLegacyClassGrades(
    normalizedMainClasses,
    "KÄY|KAY",
  );

  return normalizedLegacyGrades;
}
