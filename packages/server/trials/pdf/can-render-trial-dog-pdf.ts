const SUPPORTED_TRIAL_PDF_RULE_WINDOW_IDS = new Set([
  "trw_range_2005_2011",
  "trw_post_20110801",
  "trw_post_20230801",
]);

export function canRenderTrialDogPdf(
  trialRuleWindowId: string | null,
): boolean {
  return (
    trialRuleWindowId !== null &&
    SUPPORTED_TRIAL_PDF_RULE_WINDOW_IDS.has(trialRuleWindowId)
  );
}
