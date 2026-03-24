import type {
  BeagleDogProfileShowRowDto,
  BeagleShowDetailsRow,
  BeagleShowStructuredResultDto,
} from "@beagle/contracts";

const FALLBACK_VALUE = "-";

function formatValue(value: string | null | undefined): string {
  return value?.trim() ? value : FALLBACK_VALUE;
}

function formatAwardsValue(awards: string[] | null | undefined): string | null {
  const normalizedAwards = (awards ?? []).filter(
    (award) => award.trim().length > 0,
  );
  return normalizedAwards.length > 0 ? normalizedAwards.join(", ") : null;
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

export function formatClassResult(
  row: Pick<BeagleShowStructuredResultDto, "classCode" | "classPlacement">,
): string {
  const classCode = row.classCode?.trim() || null;
  const classPlacement =
    row.classPlacement == null ? null : String(row.classPlacement);

  if (classCode && classPlacement) {
    return `${classCode}-${classPlacement}`;
  }

  return classCode ?? classPlacement ?? FALLBACK_VALUE;
}

export function formatResultNotes(
  row: Pick<BeagleShowStructuredResultDto, "pupn" | "awards">,
): string {
  const pupn = row.pupn?.trim() || null;
  const awards = formatAwardsValue(row.awards);

  if (pupn && awards) {
    return `${pupn}, ${awards}`;
  }

  return pupn ?? awards ?? FALLBACK_VALUE;
}

export function formatPupn(
  row: Pick<BeagleShowStructuredResultDto, "pupn">,
): string {
  return formatValue(row.pupn);
}

export function formatAwards(
  row: Pick<BeagleShowStructuredResultDto, "awards">,
): string {
  return formatAwardsValue(row.awards) ?? FALLBACK_VALUE;
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

export function hasShowClassResult(
  rows: Array<
    Pick<BeagleShowStructuredResultDto, "classCode" | "classPlacement">
  >,
): boolean {
  return rows.some(
    (row) => row.classCode != null || row.classPlacement != null,
  );
}

export function hasDogProfileShowClassResult(
  rows: BeagleDogProfileShowRowDto[],
): boolean {
  return hasShowClassResult(rows);
}

export function hasShowResultNotes(
  rows: Array<Pick<BeagleShowStructuredResultDto, "pupn" | "awards">>,
): boolean {
  return rows.some((row) => row.pupn != null || row.awards.length > 0);
}

export function hasDogProfileShowResultNotes(
  rows: BeagleDogProfileShowRowDto[],
): boolean {
  return hasShowResultNotes(rows);
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
