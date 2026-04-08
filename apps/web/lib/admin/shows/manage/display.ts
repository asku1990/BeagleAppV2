import type { AdminShowResultOption } from "@beagle/contracts";
import type {
  ManageShowEditOptions,
  ManageShowEntry,
} from "@/components/admin/shows/manage/show-management-types";

export type OptionLabelLookup = Map<string, string>;

function ensureOptionExists(
  options: AdminShowResultOption[],
  value: string,
): AdminShowResultOption[] {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return options;
  }
  if (options.some((option) => option.value.trim() === normalizedValue)) {
    return options;
  }

  return [
    ...options,
    {
      value: normalizedValue,
      label: normalizedValue,
    },
  ];
}

export function createOptionLabelLookup(
  options: Array<{ value: string; label: string }>,
): OptionLabelLookup {
  return new Map(
    options.map((option) => [option.value.trim(), option.label.trim()]),
  );
}

export function resolveOptionLabel(
  lookup: OptionLabelLookup,
  value: string,
): string {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return "-";
  }

  return lookup.get(normalizedValue) ?? normalizedValue;
}

export function buildEntryDisplayState(
  entry: ManageShowEntry,
  resultOptions: ManageShowEditOptions,
) {
  const classOptions = ensureOptionExists(
    resultOptions.classOptions,
    entry.classCode,
  );
  const qualityOptions = ensureOptionExists(
    resultOptions.qualityOptions,
    entry.qualityGrade,
  );
  const awardOptions = resultOptions.awardOptions;
  const availableAwardOptions = awardOptions.filter(
    (option) =>
      !entry.awards.some((award) => award.code.trim() === option.value.trim()),
  );

  const classLabelLookup = createOptionLabelLookup(classOptions);
  const qualityLabelLookup = createOptionLabelLookup(qualityOptions);
  const awardLabelLookup = createOptionLabelLookup(awardOptions);
  const pupnLabelLookup = createOptionLabelLookup(resultOptions.pupnOptions);

  const selectedAwardsText =
    entry.awards.length > 0
      ? entry.awards
          .map((award) => resolveOptionLabel(awardLabelLookup, award.code))
          .join(", ")
      : "-";
  const selectedClassText = resolveOptionLabel(
    classLabelLookup,
    entry.classCode,
  );
  const selectedPlacementText = entry.classPlacement.trim();
  const selectedClassResultText =
    selectedClassText === "-"
      ? "-"
      : selectedPlacementText
        ? `${selectedClassText} ${selectedPlacementText}`
        : selectedClassText;

  return {
    classOptions,
    qualityOptions,
    awardOptions,
    availableAwardOptions,
    awardsDisabled: awardOptions.length === 0,
    awardLabelLookup,
    selectedClassResultText,
    selectedQualityText: resolveOptionLabel(
      qualityLabelLookup,
      entry.qualityGrade,
    ),
    selectedPupnText: entry.pupn.trim()
      ? resolveOptionLabel(pupnLabelLookup, entry.pupn)
      : "-",
    selectedAwardsText,
  };
}
