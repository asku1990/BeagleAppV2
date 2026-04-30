import path from "node:path";
import { renderCurrent2023TrialDogPdfFields } from "./current-2023/index";
import { renderLegacy2005To2011TrialDogPdfFields } from "./legacy-2005-2011/index";
import { renderLegacy2011To2023TrialDogPdfFields } from "./legacy-2011-2023/index";
import type { TrialDogPdfRuleSet } from "./types";

export const TRIAL_RULE_WINDOW_IDS = {
  PRE_2002: "trw_pre_20020801",
  RANGE_2002_2005: "trw_range_2002_2005",
  RANGE_2005_2011: "trw_range_2005_2011",
  RANGE_2011_2023: "trw_post_20110801",
  POST_2023: "trw_post_20230801",
} as const;

const TEMPLATE_2023_RELATIVE_PATH = path.join(
  "public",
  "templates",
  "ajok-poytakirja-2023.pdf",
);
const TEMPLATE_2011_2023_RELATIVE_PATH = path.join(
  "public",
  "templates",
  "ajok-poytakirja-2011-2023.pdf",
);
const TEMPLATE_2005_2011_RELATIVE_PATH = path.join(
  "public",
  "templates",
  "ajok-poytakirja-2005-2011.pdf",
);

const UNSUPPORTED_RULE_SET: TrialDogPdfRuleSet = {
  id: "unsupported",
  templateRelativePath: null,
  status: "not-supported",
};

const CURRENT_2023_RULE_SET: TrialDogPdfRuleSet = {
  id: "current-2023",
  templateRelativePath: TEMPLATE_2023_RELATIVE_PATH,
  status: "implemented",
  renderFields: renderCurrent2023TrialDogPdfFields,
};

const LEGACY_2011_2023_RULE_SET: TrialDogPdfRuleSet = {
  id: "legacy-2011-2023",
  templateRelativePath: TEMPLATE_2011_2023_RELATIVE_PATH,
  status: "implemented",
  renderFields: renderLegacy2011To2023TrialDogPdfFields,
};

const LEGACY_2005_2011_RULE_SET: TrialDogPdfRuleSet = {
  id: "legacy-2005-2011",
  templateRelativePath: TEMPLATE_2005_2011_RELATIVE_PATH,
  status: "implemented",
  renderFields: renderLegacy2005To2011TrialDogPdfFields,
};

const TRIAL_DOG_PDF_RULE_SETS = {
  [TRIAL_RULE_WINDOW_IDS.PRE_2002]: {
    id: "legacy-pre-2002",
    templateRelativePath: null,
    status: "not-supported",
  },
  [TRIAL_RULE_WINDOW_IDS.RANGE_2002_2005]: {
    id: "legacy-2002-2005",
    templateRelativePath: null,
    status: "not-supported",
  },
  [TRIAL_RULE_WINDOW_IDS.RANGE_2005_2011]: LEGACY_2005_2011_RULE_SET,
  [TRIAL_RULE_WINDOW_IDS.RANGE_2011_2023]: LEGACY_2011_2023_RULE_SET,
  [TRIAL_RULE_WINDOW_IDS.POST_2023]: CURRENT_2023_RULE_SET,
} as const satisfies Record<string, TrialDogPdfRuleSet>;

export function resolveTrialDogPdfRuleSet(
  ruleWindowId: string | null,
): TrialDogPdfRuleSet {
  if (ruleWindowId && ruleWindowId in TRIAL_DOG_PDF_RULE_SETS) {
    return TRIAL_DOG_PDF_RULE_SETS[
      ruleWindowId as keyof typeof TRIAL_DOG_PDF_RULE_SETS
    ];
  }

  return UNSUPPORTED_RULE_SET;
}

export function getTrialDogPdfRuleSetId(ruleWindowId: string | null): string {
  return resolveTrialDogPdfRuleSet(ruleWindowId).id;
}

export function getTrialDogPdfRuleSetStatus(
  ruleWindowId: string | null,
): TrialDogPdfRuleSet["status"] {
  return resolveTrialDogPdfRuleSet(ruleWindowId).status;
}

export function canRenderTrialDogPdf(ruleWindowId: string | null): boolean {
  return resolveTrialDogPdfRuleSet(ruleWindowId).templateRelativePath != null;
}

export function getSeededTrialDogPdfRuleWindowIds(): string[] {
  return Object.values(TRIAL_RULE_WINDOW_IDS);
}
