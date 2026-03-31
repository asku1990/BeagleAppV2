export type SelectOption = {
  value: string;
  label: string;
};

// Hardcoded definition-backed options for the UI shell.
// Replace these with database-driven result definitions when the read layer lands.
export const CLASS_CODE_OPTIONS: SelectOption[] = [
  { value: "", label: "No class" },
  { value: "PEN", label: "PEN - Puppy class" },
  { value: "JUN", label: "JUN - Junior class" },
  { value: "NUO", label: "NUO - Young class" },
  { value: "AVO", label: "AVO - Open class" },
  { value: "KÄY", label: "KÄY - Working class" },
  { value: "VAL", label: "VAL - Champion class" },
  { value: "VET", label: "VET - Veteran class" },
];

export const QUALITY_GRADE_OPTIONS: SelectOption[] = [
  { value: "", label: "No quality grade" },
  { value: "ERI", label: "ERI - Excellent" },
  { value: "EH", label: "EH - Very good" },
  { value: "H", label: "H - Good" },
  { value: "T", label: "T - Sufficient" },
  { value: "HYL", label: "HYL - Disqualified" },
  { value: "EVA", label: "EVA - Not evaluated" },
];
