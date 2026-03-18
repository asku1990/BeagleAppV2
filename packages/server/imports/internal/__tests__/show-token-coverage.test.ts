import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LegacyShowResultRow } from "@beagle/db";
import { getShowTokenCoverageReport } from "../show-token-coverage";

const { showResultDefinitionFindManyMock } = vi.hoisted(() => ({
  showResultDefinitionFindManyMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  prisma: {
    showResultDefinition: { findMany: showResultDefinitionFindManyMock },
  },
}));

describe("getShowTokenCoverageReport", () => {
  beforeEach(() => {
    showResultDefinitionFindManyMock.mockReset();
    showResultDefinitionFindManyMock.mockResolvedValue([]);
  });

  it("accepts renamed canonical parser codes when enabled definitions still use legacy codes", async () => {
    showResultDefinitionFindManyMock.mockResolvedValue([
      { id: "def-nord-vara", code: "NORD_VARASERT" },
      { id: "def-laatu-numero", code: "LAATU_NUMERO" },
      { id: "def-jun", code: "JUN" },
    ]);

    const rows: LegacyShowResultRow[] = [
      {
        registrationNo: "FI-1/20",
        eventDateRaw: "20020101",
        eventPlace: "Helsinki",
        resultText: "NORDVARASERT JUN1",
        critiqueText: null,
        dogName: "Dog One",
        heightText: null,
        judge: null,
        legacyFlag: null,
        sourceTable: "nay9599",
      },
    ];

    const report = await getShowTokenCoverageReport(rows);

    expect(report.missingDefinitionCodes).toEqual([]);
    expect(report.unmapped).toEqual([]);
  });
});
