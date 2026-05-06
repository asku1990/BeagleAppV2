type ImportIssueRow = {
  stage: string;
  severity: string;
  code: string;
  message: string;
  registrationNo: string | null;
  sourceTable: string | null;
  payloadJson: string | null;
};

export type ImportIssueSummary = {
  total: number;
  topCodes: Array<{ code: string; count: number }>;
  samples: ImportIssueRow[];
};

type ImportIssueSummaryCollector = {
  add(issue: ImportIssueRow): void;
  build(): ImportIssueSummary;
};

function sortedTopCodes(codeCounts: Map<string, number>): Array<{
  code: string;
  count: number;
}> {
  return [...codeCounts.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((left, right) => {
      if (right.count !== left.count) return right.count - left.count;
      return left.code.localeCompare(right.code);
    })
    .slice(0, 3);
}

// Collects a run-level issue summary while the script streams through pages.
export function createImportIssueSummaryCollector(): ImportIssueSummaryCollector {
  const codeCounts = new Map<string, number>();
  const samples: ImportIssueRow[] = [];
  let total = 0;

  return {
    add(issue) {
      total += 1;
      codeCounts.set(issue.code, (codeCounts.get(issue.code) ?? 0) + 1);
      if (samples.length < 10) {
        samples.push(issue);
      }
    },
    build() {
      return {
        total,
        topCodes: sortedTopCodes(codeCounts),
        samples: [...samples],
      };
    },
  };
}

export function formatImportIssueSummary(
  summary: ImportIssueSummary,
): string[] {
  const lines: string[] = [];
  if (summary.total === 0) {
    return lines;
  }

  lines.push(`Issue summary: total=${summary.total}`);

  if (summary.topCodes.length > 0) {
    lines.push(`Top issue codes:`);
    for (const topCode of summary.topCodes) {
      lines.push(`  ${topCode.code} = ${topCode.count}`);
    }
  }

  if (summary.samples.length > 0) {
    lines.push(`Sample issues:`);
    for (const sample of summary.samples) {
      lines.push(
        `  [${sample.stage}/${sample.severity}/${sample.code}] reg=${sample.registrationNo ?? "-"} table=${sample.sourceTable ?? "-"} msg=${sample.message}`,
      );
      if (sample.payloadJson) {
        const trimmed =
          sample.payloadJson.length > 500
            ? `${sample.payloadJson.slice(0, 500)}...`
            : sample.payloadJson;
        lines.push(`    payload=${trimmed}`);
      }
    }
  }

  return lines;
}
