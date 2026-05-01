import type {
  TrialMirrorValidationIssue,
  TrialMirrorValidationReport,
  TrialMirrorValidationSeverity,
} from "./validate-trial-mirror";

const SEVERITIES: TrialMirrorValidationSeverity[] = [
  "ERROR",
  "WARNING",
  "INFO",
];

function formatIssue(issue: TrialMirrorValidationIssue): string {
  const parts = [
    `[${issue.severity}]`,
    issue.code,
    `table=${issue.sourceTable}`,
  ];
  if (issue.key) parts.push(`key=${issue.key}`);
  if (issue.field) parts.push(`field=${issue.field}`);
  if (issue.value != null) parts.push(`value=${issue.value}`);
  return `${parts.join(" ")} - ${issue.message}`;
}

function summarizeCodes(issues: TrialMirrorValidationIssue[]): string[] {
  const counts = new Map<string, number>();
  for (const issue of issues) {
    counts.set(issue.code, (counts.get(issue.code) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort(
      (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
    )
    .map(([code, count]) => `- ${code}: ${count}`);
}

export function formatTrialMirrorValidationReport(
  report: TrialMirrorValidationReport,
  options?: { maxIssueSamples?: number },
): string[] {
  const maxIssueSamples = options?.maxIssueSamples ?? 25;
  const lines = [
    "Trial mirror validation",
    "",
    "Counts:",
    `- akoeall: ${report.counts.akoeall}`,
    `- bealt: ${report.counts.bealt}`,
    `- bealt0: ${report.counts.bealt0}`,
    `- bealt1: ${report.counts.bealt1}`,
    `- bealt2: ${report.counts.bealt2}`,
    `- bealt3: ${report.counts.bealt3}`,
    `- total: ${report.totalRows}`,
    "",
    "Relationships:",
    `- detail rows with akoeall: ${report.detailRowsWithAkoeall}`,
    `- akoeall rows with details: ${report.akoeallRowsWithDetails}`,
    `- akoeall rows without details: ${report.akoeallRowsWithoutDetails}`,
    "",
    "Issues:",
    ...SEVERITIES.map(
      (severity) => `- ${severity}: ${report.issueCounts[severity]}`,
    ),
  ];

  const codeSummary = summarizeCodes(report.issues);
  if (codeSummary.length > 0) {
    lines.push("", "Issue codes:", ...codeSummary);
  }

  if (report.issues.length > 0) {
    lines.push(
      "",
      `Sample issues (first ${Math.min(maxIssueSamples, report.issues.length)}):`,
      ...report.issues.slice(0, maxIssueSamples).map(formatIssue),
    );
  }

  return lines;
}
