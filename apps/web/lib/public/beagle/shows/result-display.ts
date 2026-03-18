import type {
  BeagleDogProfileShowRowDto,
  BeagleShowDetailsRow,
  BeagleShowStructuredResultDto,
} from "@beagle/contracts";

const FALLBACK_VALUE = "-";

function formatValue(value: string | null | undefined): string {
  return value?.trim() ? value : FALLBACK_VALUE;
}

export function formatShowType(
  row: Pick<BeagleShowStructuredResultDto, "showType">,
): string {
  return formatValue(row.showType);
}

export function formatClassCode(
  row: Pick<BeagleShowStructuredResultDto, "classCode">,
): string {
  return formatValue(row.classCode);
}

export function formatQualityGrade(
  row: Pick<BeagleShowStructuredResultDto, "qualityGrade">,
): string {
  return formatValue(row.qualityGrade);
}

export function formatClassPlacement(
  row: Pick<BeagleShowStructuredResultDto, "classPlacement">,
): string {
  return row.classPlacement == null
    ? FALLBACK_VALUE
    : String(row.classPlacement);
}

export function formatPupn(
  row: Pick<BeagleShowStructuredResultDto, "pupn">,
): string {
  return formatValue(row.pupn);
}

export function formatAwards(
  row: Pick<BeagleShowStructuredResultDto, "awards">,
): string {
  const awards = (row.awards ?? []).filter((award) => award.trim().length > 0);
  return awards.length > 0 ? awards.join(", ") : FALLBACK_VALUE;
}

export function formatCritiqueText(
  row: Pick<BeagleShowDetailsRow, "critiqueText">,
  pendingLabel: string,
): string {
  const critique = row.critiqueText?.trim();
  return critique || pendingLabel;
}

export function hasDogProfileShowQuality(
  rows: BeagleDogProfileShowRowDto[],
): boolean {
  return rows.some((row) => row.qualityGrade != null);
}

export function hasDogProfileShowType(
  rows: BeagleDogProfileShowRowDto[],
): boolean {
  return rows.some((row) => row.showType != null);
}

export function hasDogProfileShowPlacement(
  rows: BeagleDogProfileShowRowDto[],
): boolean {
  return rows.some((row) => row.classPlacement != null);
}

export function hasDogProfileShowClass(
  rows: BeagleDogProfileShowRowDto[],
): boolean {
  return rows.some((row) => row.classCode != null);
}

export function hasDogProfileShowPupn(
  rows: BeagleDogProfileShowRowDto[],
): boolean {
  return rows.some((row) => row.pupn != null);
}

export function hasDogProfileShowAwards(
  rows: BeagleDogProfileShowRowDto[],
): boolean {
  return rows.some((row) => row.awards.length > 0);
}

export function hasDogProfileShowCritique(
  rows: BeagleDogProfileShowRowDto[],
): boolean {
  return rows.some((row) => row.critiqueText?.trim());
}
