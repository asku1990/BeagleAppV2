const SHOW_GRADE_AWARDS = ["ERI", "EH", "H", "T", "EVA", "HYL"] as const;
const LEGACY_CLASS_TOKEN = "JUN|NUO|AVO|VAL|VET|KÄY|KAY";

type NormalizeShowResultOptions = {
  mode?: "parser" | "display";
};

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
  options?: NormalizeShowResultOptions,
): string | null {
  if (!result) {
    return null;
  }

  const trimmed = result.trim();
  if (!trimmed) {
    return null;
  }

  const mode = options?.mode ?? "parser";

  // Legacy rule (nay.php):
  // Convert old show codes (e.g. JUN1 -> JUN-ERI) only for dates >= 2003-01-01.
  if (eventDateIsoDate < "2003-01-01") {
    if (mode === "display") {
      return trimmed.replace(
        new RegExp(`\\b(${LEGACY_CLASS_TOKEN})([1-6])\\b`, "gi"),
        (_, cls, grade) =>
          `${String(cls).toUpperCase().replace("KAY", "KÄY")}-${String(grade)}`,
      );
    }
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
