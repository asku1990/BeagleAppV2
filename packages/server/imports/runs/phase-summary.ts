import { ImportKind } from "@beagle/db";
import type { LegacyTrialMirrorCounts } from "@beagle/db";

type LegacyImportKind =
  | "LEGACY_PHASE1"
  | "LEGACY_PHASE1_5"
  | "LEGACY_PHASE3"
  | "LEGACY_TRIAL_MIRROR"
  | "LEGACY_PHASE5";

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
      kind: "LEGACY_TRIAL_MIRROR";
      mirrorRowsUpserted: number;
      errorsCount: number;
      warningsCount: number;
      sourceCounts: LegacyTrialMirrorCounts;
      mirrorCounts: LegacyTrialMirrorCounts;
      zeroDateRows: number;
    }
  | {
      kind: "LEGACY_PHASE3";
      showResultsUpserted: number;
      errorsCount: number;
    }
  | {
      kind: "LEGACY_PHASE5";
      eventsProjected: number;
      entriesProjected: number;
      erasProjected: number;
      eraLisatiedotProjected: number;
      skippedOrphanDetails: number;
      skippedNonSelectedDetails: number;
      unresolvedRules: number;
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
    case ImportKind.LEGACY_PHASE3:
      return "Phase 3";
    case "LEGACY_TRIAL_MIRROR":
      return "Phase 2";
    case "LEGACY_PHASE5":
      return "Phase 5";
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
    case "LEGACY_TRIAL_MIRROR":
      return `${phaseLabel}: ${formatMetric("mirrorRows", input.mirrorRowsUpserted)}, ${formatMetric("sourceRows", input.sourceCounts.akoeall + input.sourceCounts.bealt + input.sourceCounts.bealt0 + input.sourceCounts.bealt1 + input.sourceCounts.bealt2 + input.sourceCounts.bealt3)}, ${formatMetric("storedRows", input.mirrorCounts.akoeall + input.mirrorCounts.bealt + input.mirrorCounts.bealt0 + input.mirrorCounts.bealt1 + input.mirrorCounts.bealt2 + input.mirrorCounts.bealt3)}, ${formatMetric("zeroDateMuokattu", input.zeroDateRows)}, ${formatMetric("warnings", input.warningsCount)}, ${formatMetric("errors", input.errorsCount)}.`;
    case ImportKind.LEGACY_PHASE3:
      return `${phaseLabel}: ${formatMetric("showResults", input.showResultsUpserted)}, ${formatMetric("errors", input.errorsCount)}.`;
    case "LEGACY_PHASE5":
      return `${phaseLabel}: ${formatMetric("events", input.eventsProjected)}, ${formatMetric("entries", input.entriesProjected)}, ${formatMetric("eras", input.erasProjected)}, ${formatMetric("eraLisatiedot", input.eraLisatiedotProjected)}, ${formatMetric("skippedOrphans", input.skippedOrphanDetails)}, ${formatMetric("skippedNonSelected", input.skippedNonSelectedDetails)}, ${formatMetric("unresolvedRules", input.unresolvedRules)}, ${formatMetric("errors", input.errorsCount)}.`;
  }
}
