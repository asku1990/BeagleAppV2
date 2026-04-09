import { beforeEach, describe, expect, it, vi } from "vitest";
import { runLegacyPhase1_5 } from "../run-legacy-phase1_5";

const {
  createImportRunMock,
  markImportRunRunningMock,
  markImportRunFinishedMock,
  createImportRunIssueMock,
  createImportRunIssuesBulkMock,
  fetchLegacyPhase1_5RowsMock,
  dogRegistrationFindManyMock,
  dogTitleCreateManyMock,
} = vi.hoisted(() => ({
  createImportRunMock: vi.fn(),
  markImportRunRunningMock: vi.fn(),
  markImportRunFinishedMock: vi.fn(),
  createImportRunIssueMock: vi.fn(),
  createImportRunIssuesBulkMock: vi.fn(),
  fetchLegacyPhase1_5RowsMock: vi.fn(),
  dogRegistrationFindManyMock: vi.fn(),
  dogTitleCreateManyMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  ImportKind: {
    LEGACY_PHASE1_5: "LEGACY_PHASE1_5",
  },
  createImportRun: createImportRunMock,
  markImportRunRunning: markImportRunRunningMock,
  markImportRunFinished: markImportRunFinishedMock,
  createImportRunIssue: createImportRunIssueMock,
  createImportRunIssuesBulk: createImportRunIssuesBulkMock,
  fetchLegacyPhase1_5Rows: fetchLegacyPhase1_5RowsMock,
  prisma: {
    dogRegistration: { findMany: dogRegistrationFindManyMock },
    dogTitle: { createMany: dogTitleCreateManyMock },
  },
}));

describe("runLegacyPhase1_5", () => {
  beforeEach(() => {
    createImportRunMock.mockReset();
    markImportRunRunningMock.mockReset();
    markImportRunFinishedMock.mockReset();
    createImportRunIssueMock.mockReset();
    createImportRunIssuesBulkMock.mockReset();
    fetchLegacyPhase1_5RowsMock.mockReset();
    dogRegistrationFindManyMock.mockReset();
    dogTitleCreateManyMock.mockReset();

    createImportRunMock.mockResolvedValue({ id: "run-15" });
    markImportRunRunningMock.mockResolvedValue(undefined);
    markImportRunFinishedMock.mockResolvedValue({
      id: "run-15",
      kind: "LEGACY_PHASE1_5",
      status: "SUCCEEDED",
      dogsUpserted: 0,
      ownersUpserted: 0,
      ownershipsUpserted: 0,
      trialResultsUpserted: 0,
      showResultsUpserted: 0,
      errorsCount: 0,
      startedAt: new Date("2024-01-01T00:00:00.000Z"),
      finishedAt: new Date("2024-01-01T00:00:01.000Z"),
      errorSummary: null,
      createdByUserId: "user-1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:01.000Z"),
      issuesCount: 1,
    });
    dogTitleCreateManyMock.mockResolvedValue({ count: 0 });
  });

  it("imports titles, skips blanks, deduplicates same-value aliases, and records conflicts", async () => {
    fetchLegacyPhase1_5RowsMock.mockResolvedValue([
      { registrationNo: "FI-1/20", titleCodeRaw: "SE JCH" },
      { registrationNo: "FI-1A/20", titleCodeRaw: "fi jch" },
      { registrationNo: "FI-1B/20", titleCodeRaw: "FI JVA" },
      { registrationNo: "FI-1/20", titleCodeRaw: "   " },
      { registrationNo: null, titleCodeRaw: "FI JVA" },
      { registrationNo: "BAD REG", titleCodeRaw: "FI JVA" },
      { registrationNo: "FI-404/20", titleCodeRaw: "FI JVA" },
    ]);
    dogRegistrationFindManyMock.mockResolvedValue([
      { registrationNo: "FI-1/20", dogId: "dog-1" },
      { registrationNo: "FI-1A/20", dogId: "dog-1" },
      { registrationNo: "FI-1B/20", dogId: "dog-1" },
    ]);

    const result = await runLegacyPhase1_5("user-1");

    expect(result.status).toBe(202);
    expect(dogTitleCreateManyMock).toHaveBeenCalledWith({
      data: [
        {
          dogId: "dog-1",
          titleCode: "SE JCH",
          titleName: null,
          awardedOn: null,
          sortOrder: 0,
        },
      ],
    });
    expect(createImportRunIssuesBulkMock).toHaveBeenCalledWith(
      "run-15",
      expect.arrayContaining([
        expect.objectContaining({ code: "TITLE_REGISTRATION_MISSING" }),
        expect.objectContaining({ code: "TITLE_REGISTRATION_INVALID_FORMAT" }),
        expect.objectContaining({ code: "TITLE_DOG_NOT_FOUND" }),
        expect.objectContaining({ code: "TITLE_ALIAS_VALUE_CONFLICT" }),
      ]),
      expect.any(Object),
    );
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-15",
      expect.objectContaining({
        status: "SUCCEEDED",
        errorsCount: 4,
        errorSummary: "Import completed with warnings.",
      }),
      expect.any(Object),
    );
  });

  it("uses deterministic fallback value when no canonical registration row exists in source rows", async () => {
    fetchLegacyPhase1_5RowsMock.mockResolvedValue([
      { registrationNo: "FI-ALIAS-1/20", titleCodeRaw: "SE JCH" },
      { registrationNo: "FI-ALIAS-2/20", titleCodeRaw: "fi jva" },
    ]);
    dogRegistrationFindManyMock.mockResolvedValue([
      { registrationNo: "FI-BASE/20", dogId: "dog-2" },
      { registrationNo: "FI-ALIAS-1/20", dogId: "dog-2" },
      { registrationNo: "FI-ALIAS-2/20", dogId: "dog-2" },
    ]);

    await runLegacyPhase1_5("user-1");

    expect(dogTitleCreateManyMock).toHaveBeenCalledWith({
      data: [
        {
          dogId: "dog-2",
          titleCode: "fi jva",
          titleName: null,
          awardedOn: null,
          sortOrder: 0,
        },
      ],
    });
    expect(createImportRunIssuesBulkMock).toHaveBeenCalledWith(
      "run-15",
      expect.arrayContaining([
        expect.objectContaining({
          code: "TITLE_ALIAS_VALUE_CONFLICT",
        }),
      ]),
      expect.any(Object),
    );
  });
});
