type TrialRuleWindowLike = {
  id: string;
  fromYmd: number | null;
  toYmd: number | null;
};

function dateToYmd(date: Date): number {
  return (
    date.getUTCFullYear() * 10000 +
    (date.getUTCMonth() + 1) * 100 +
    date.getUTCDate()
  );
}

export function resolveTrialRuleWindowId(
  ruleWindows: TrialRuleWindowLike[],
  koepaiva: Date,
): string | null {
  const ymd = dateToYmd(koepaiva);
  const matched = ruleWindows.find((rule) => {
    if (rule.fromYmd != null && ymd < rule.fromYmd) return false;
    if (rule.toYmd != null && ymd > rule.toYmd) return false;
    return true;
  });
  return matched?.id ?? null;
}
