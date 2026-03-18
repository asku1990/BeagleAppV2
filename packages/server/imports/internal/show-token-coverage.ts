import { prisma, type LegacyShowResultRow } from "@beagle/db";
import { normalizeRegistrationNo, parseLegacyDate } from "../core";
import { toEventSourceDatePart } from "./date-key";
import { buildDefinitionLookup } from "./show-result-definition-lookup";
import { parseShowResultText } from "./show-result-parser";

type TokenCoverageSample = {
  registrationNo: string;
  eventDateRaw: string | null;
  eventPlace: string | null;
  sourceTable: string;
};

export type ShowTokenCoverageIssue = {
  token: string;
  count: number;
  samples: TokenCoverageSample[];
};

export type ShowTokenCoverageReport = {
  totalDistinctTokens: number;
  mappedDistinctTokens: number;
  unmappedOccurrences: number;
  unmapped: ShowTokenCoverageIssue[];
  missingDefinitionCodes: string[];
};

export async function getShowTokenCoverageReport(
  rows: LegacyShowResultRow[],
): Promise<ShowTokenCoverageReport> {
  const definitionRows = await prisma.showResultDefinition.findMany({
    where: { isEnabled: true },
    select: { id: true, code: true },
  });
  const definitionLookup = buildDefinitionLookup(definitionRows);

  const tokenCounts = new Map<string, number>();
  const unmappedByToken = new Map<string, ShowTokenCoverageIssue>();
  const missingDefinitionCodes = new Set<string>();

  for (const row of rows) {
    const registrationNo = normalizeRegistrationNo(row.registrationNo);
    const eventDate = parseLegacyDate(row.eventDateRaw);
    const eventDateIsoDate = eventDate ? toEventSourceDatePart(eventDate) : "";
    if (!registrationNo || !eventDateIsoDate) continue;

    const parsed = parseShowResultText(row.resultText, eventDateIsoDate);
    for (const token of parsed.tokens) {
      const upper = token.toUpperCase();
      tokenCounts.set(upper, (tokenCounts.get(upper) ?? 0) + 1);
    }

    for (const item of parsed.items) {
      if (!definitionLookup.findDefinitionId(item.definitionCode)) {
        missingDefinitionCodes.add(item.definitionCode);
      }
    }

    for (const token of parsed.unmappedTokens) {
      const upper = token.toUpperCase();
      const current = unmappedByToken.get(upper);
      if (!current) {
        unmappedByToken.set(upper, {
          token: upper,
          count: 1,
          samples: [
            {
              registrationNo,
              eventDateRaw: row.eventDateRaw,
              eventPlace: row.eventPlace,
              sourceTable: row.sourceTable,
            },
          ],
        });
        continue;
      }
      current.count += 1;
      if (current.samples.length < 3) {
        current.samples.push({
          registrationNo,
          eventDateRaw: row.eventDateRaw,
          eventPlace: row.eventPlace,
          sourceTable: row.sourceTable,
        });
      }
    }
  }

  const unmapped = [...unmappedByToken.values()].sort(
    (a, b) => b.count - a.count,
  );
  const totalDistinctTokens = tokenCounts.size;
  const mappedDistinctTokens = totalDistinctTokens - unmapped.length;
  const unmappedOccurrences = unmapped.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  return {
    totalDistinctTokens,
    mappedDistinctTokens,
    unmappedOccurrences,
    unmapped,
    missingDefinitionCodes: [...missingDefinitionCodes].sort(),
  };
}
