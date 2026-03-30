import type { AdminShowWorkbookImportIssue } from "@beagle/contracts";

// Builds compact structured log metadata for workbook import issue/result inspection.
export function buildWorkbookIssueLogSummary(
  issues: AdminShowWorkbookImportIssue[],
) {
  const issueCountsByCode = new Map<string, number>();

  for (const issue of issues) {
    issueCountsByCode.set(
      issue.code,
      (issueCountsByCode.get(issue.code) ?? 0) + 1,
    );
  }

  return {
    issueCount: issues.length,
    topIssueCodes: [...issueCountsByCode.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10)
      .map(([code, count]) => ({ code, count })),
    issueSamples: issues.slice(0, 5).map((issue) => ({
      code: issue.code,
      severity: issue.severity,
      rowNumber: issue.rowNumber,
      columnName: issue.columnName,
      registrationNo: issue.registrationNo,
      eventLookupKey: issue.eventLookupKey,
      message: issue.message,
    })),
  };
}
