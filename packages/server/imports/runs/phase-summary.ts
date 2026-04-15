import { ImportKind } from "@beagle/db";

type LegacyImportKind =
  | "LEGACY_PHASE1"
  | "LEGACY_PHASE1_5"
  | "LEGACY_PHASE2"
  | "LEGACY_PHASE3";

type LegacyImportSummaryInput =
  | {
      kind: "LEGACY_PHASE1";
      dogsUpserted: number;
      ownersUpserted: number;
      ownershipsUpserted: number;
      errorsCount: number;
    }
  | {
      kind: "LEGACY_PHASE1_5";
      titlesInserted: number;
      skippedBlank: number;
      conflicts: number;
      errorsCount: number;
    }
  | {
      kind: "LEGACY_PHASE2";
      trialResultsUpserted: number;
      errorsCount: number;
      canonicalTrialEntryCount?: number;
      warningsCount?: number;
    }
  | {
      kind: "LEGACY_PHASE3";
      showResultsUpserted: number;
      errorsCount: number;
    };

function formatMetric(label: string, value: number): string {
  return `${label}=${value}`;
}

function toPhaseLabel(kind: LegacyImportKind): string {
  switch (kind) {
    case ImportKind.LEGACY_PHASE1:
      return "Phase 1";
    case ImportKind.LEGACY_PHASE1_5:
      return "Phase 1.5";
    case ImportKind.LEGACY_PHASE2:
      return "Phase 2";
    case ImportKind.LEGACY_PHASE3:
      return "Phase 3";
  }
}

// Formats the final, human-facing summary stored on each legacy import run.
export function formatLegacyImportSummary(
  input: LegacyImportSummaryInput,
): string {
  const phaseLabel = toPhaseLabel(input.kind);

  switch (input.kind) {
    case ImportKind.LEGACY_PHASE1:
      return `${phaseLabel}: ${formatMetric("dogs", input.dogsUpserted)}, ${formatMetric("owners", input.ownersUpserted)}, ${formatMetric("ownerships", input.ownershipsUpserted)}, ${formatMetric("errors", input.errorsCount)}.`;
    case ImportKind.LEGACY_PHASE1_5:
      return `${phaseLabel}: ${formatMetric("titles", input.titlesInserted)}, ${formatMetric("skippedBlank", input.skippedBlank)}, ${formatMetric("conflicts", input.conflicts)}, ${formatMetric("errors", input.errorsCount)}.`;
    case ImportKind.LEGACY_PHASE2:
      return `${phaseLabel}: ${formatMetric("canonicalTrialEntry", input.canonicalTrialEntryCount ?? 0)}, ${formatMetric("warnings", input.warningsCount ?? 0)}, ${formatMetric("errors", input.errorsCount)}.`;
    case ImportKind.LEGACY_PHASE3:
      return `${phaseLabel}: ${formatMetric("showResults", input.showResultsUpserted)}, ${formatMetric("errors", input.errorsCount)}.`;
  }
}
