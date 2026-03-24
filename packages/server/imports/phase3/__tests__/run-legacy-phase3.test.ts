import { beforeEach, describe, expect, it, vi } from "vitest";
import { runLegacyPhase3 } from "../run-legacy-phase3";

const {
  createImportRunMock,
  markImportRunRunningMock,
  markImportRunFinishedMock,
  createImportRunIssueMock,
  createImportRunIssuesBulkMock,
  fetchLegacyShowRowsMock,
  upsertShowRowsMock,
  showEventCountMock,
  showEntryCountMock,
  showResultItemCountMock,
  dogRegistrationFindManyMock,
} = vi.hoisted(() => ({
  createImportRunMock: vi.fn(),
  markImportRunRunningMock: vi.fn(),
  markImportRunFinishedMock: vi.fn(),
  createImportRunIssueMock: vi.fn(),
  createImportRunIssuesBulkMock: vi.fn(),
  fetchLegacyShowRowsMock: vi.fn(),
  upsertShowRowsMock: vi.fn(),
  showEventCountMock: vi.fn(),
  showEntryCountMock: vi.fn(),
  showResultItemCountMock: vi.fn(),
  dogRegistrationFindManyMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  ImportKind: {
    LEGACY_PHASE3: "LEGACY_PHASE3",
  },
  createImportRun: createImportRunMock,
  markImportRunRunning: markImportRunRunningMock,
  markImportRunFinished: markImportRunFinishedMock,
  createImportRunIssue: createImportRunIssueMock,
  createImportRunIssuesBulk: createImportRunIssuesBulkMock,
  fetchLegacyShowRows: fetchLegacyShowRowsMock,
  prisma: {
    showEvent: { count: showEventCountMock },
    showEntry: { count: showEntryCountMock },
    showResultItem: { count: showResultItemCountMock },
    dogRegistration: { findMany: dogRegistrationFindManyMock },
  },
}));

vi.mock("../../internal", () => ({
  upsertShowRows: upsertShowRowsMock,
}));

describe("runLegacyPhase3", () => {
  beforeEach(() => {
    createImportRunMock.mockReset();
    markImportRunRunningMock.mockReset();
    markImportRunFinishedMock.mockReset();
    createImportRunIssueMock.mockReset();
    createImportRunIssuesBulkMock.mockReset();
    fetchLegacyShowRowsMock.mockReset();
    upsertShowRowsMock.mockReset();
    showEventCountMock.mockReset();
    showEntryCountMock.mockReset();
    showResultItemCountMock.mockReset();
    dogRegistrationFindManyMock.mockReset();

    createImportRunMock.mockResolvedValue({ id: "run-1" });
    markImportRunRunningMock.mockResolvedValue(undefined);
    markImportRunFinishedMock.mockResolvedValue({
      id: "run-1",
      kind: "LEGACY_PHASE3",
      status: "SUCCEEDED",
      dogsUpserted: 0,
      ownersUpserted: 0,
      ownershipsUpserted: 0,
      trialResultsUpserted: 0,
      showResultsUpserted: 1,
      errorsCount: 0,
      startedAt: new Date("2024-01-01T00:00:00.000Z"),
      finishedAt: new Date("2024-01-01T00:00:01.000Z"),
      errorSummary: null,
      createdByUserId: "user-1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:01.000Z"),
      issuesCount: 1,
    });
    dogRegistrationFindManyMock.mockResolvedValue([]);
  });

  it("fails fast when canonical show tables are not empty", async () => {
    showEventCountMock.mockResolvedValue(1);
    showEntryCountMock.mockResolvedValue(0);
    showResultItemCountMock.mockResolvedValue(0);

    const result = await runLegacyPhase3("user-1");

    expect(result.status).toBe(409);
    expect(result.body.ok).toBe(false);
    if (result.body.ok) throw new Error("Expected error response");
    expect(result.body.code).toBe("LEGACY_PHASE3_ONE_SHOT_ONLY");

    expect(createImportRunIssueMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({
        stage: "preflight-initial-only",
        severity: "ERROR",
        code: "LEGACY_PHASE3_ONE_SHOT_ONLY",
      }),
      expect.any(Object),
    );
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({
        status: "FAILED",
        errorsCount: 1,
      }),
      expect.any(Object),
    );
    expect(fetchLegacyShowRowsMock).not.toHaveBeenCalled();
    expect(upsertShowRowsMock).not.toHaveBeenCalled();
  });

  it("preserves INFO severity for show format notes", async () => {
    showEventCountMock.mockResolvedValue(0);
    showEntryCountMock.mockResolvedValue(0);
    showResultItemCountMock.mockResolvedValue(0);
    fetchLegacyShowRowsMock.mockResolvedValue([
      {
        registrationNo: "FI-1/20",
        eventDateRaw: "20030101",
        eventPlace: "Helsinki",
        resultText: "JUN1",
        critiqueText: null,
        dogName: "Dog One",
        heightText: null,
        judge: null,
        legacyFlag: null,
        sourceTable: "nay9599",
      },
    ]);
    upsertShowRowsMock.mockResolvedValue({
      upserted: 1,
      errors: 0,
      issues: [
        {
          severity: "INFO",
          code: "SHOW_RESULT_LAATUARVOSTELU_FORMAT_CHANGED",
          message: "informational note",
          registrationNo: "FI-1/20",
          sourceTable: "nay9599",
          payloadJson: "{}",
        },
      ],
    });

    const result = await runLegacyPhase3("user-1");

    expect(result.status).toBe(202);
    expect(createImportRunIssuesBulkMock).toHaveBeenCalledWith(
      "run-1",
      expect.arrayContaining([
        expect.objectContaining({
          stage: "shows",
          severity: "INFO",
          code: "SHOW_RESULT_LAATUARVOSTELU_FORMAT_CHANGED",
        }),
      ]),
      expect.any(Object),
    );
  });
});
