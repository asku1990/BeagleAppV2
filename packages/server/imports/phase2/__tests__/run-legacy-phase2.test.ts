import { beforeEach, describe, expect, it, vi } from "vitest";
import { runLegacyPhase2 } from "../run-legacy-phase2";

const {
  createImportRunMock,
  markImportRunRunningMock,
  markImportRunFinishedMock,
  createImportRunIssueMock,
  createImportRunIssuesBulkMock,
  fetchLegacyTrialMirrorRowsMock,
  upsertLegacyTrialMirrorRowsDbMock,
  countLegacyTrialMirrorRowsDbMock,
} = vi.hoisted(() => ({
  createImportRunMock: vi.fn(),
  markImportRunRunningMock: vi.fn(),
  markImportRunFinishedMock: vi.fn(),
  createImportRunIssueMock: vi.fn(),
  createImportRunIssuesBulkMock: vi.fn(),
  fetchLegacyTrialMirrorRowsMock: vi.fn(),
  upsertLegacyTrialMirrorRowsDbMock: vi.fn(),
  countLegacyTrialMirrorRowsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  ImportKind: {
    LEGACY_PHASE1: "LEGACY_PHASE1",
    LEGACY_PHASE1_5: "LEGACY_PHASE1_5",
    LEGACY_PHASE3: "LEGACY_PHASE3",
    LEGACY_TRIAL_MIRROR: "LEGACY_TRIAL_MIRROR",
  },
  TRIAL_MIRROR_TABLES: [
    "akoeall",
    "bealt",
    "bealt0",
    "bealt1",
    "bealt2",
    "bealt3",
  ],
  createImportRun: createImportRunMock,
  markImportRunRunning: markImportRunRunningMock,
  markImportRunFinished: markImportRunFinishedMock,
  createImportRunIssue: createImportRunIssueMock,
  createImportRunIssuesBulk: createImportRunIssuesBulkMock,
  fetchLegacyTrialMirrorRows: fetchLegacyTrialMirrorRowsMock,
  upsertLegacyTrialMirrorRowsDb: upsertLegacyTrialMirrorRowsDbMock,
  countLegacyTrialMirrorRowsDb: countLegacyTrialMirrorRowsDbMock,
}));

const emptyRows = {
  akoeall: [],
  bealt: [],
  bealt0: [],
  bealt1: [],
  bealt2: [],
  bealt3: [],
};

const counts = {
  akoeall: 1,
  bealt: 1,
  bealt0: 0,
  bealt1: 0,
  bealt2: 0,
  bealt3: 0,
};

describe("runLegacyPhase2", () => {
  beforeEach(() => {
    createImportRunMock.mockReset();
    markImportRunRunningMock.mockReset();
    markImportRunFinishedMock.mockReset();
    createImportRunIssueMock.mockReset();
    createImportRunIssuesBulkMock.mockReset();
    fetchLegacyTrialMirrorRowsMock.mockReset();
    upsertLegacyTrialMirrorRowsDbMock.mockReset();
    countLegacyTrialMirrorRowsDbMock.mockReset();

    createImportRunMock.mockResolvedValue({ id: "run-2" });
    markImportRunRunningMock.mockResolvedValue(undefined);
    markImportRunFinishedMock.mockResolvedValue({
      id: "run-2",
      kind: "LEGACY_TRIAL_MIRROR",
      status: "SUCCEEDED",
      dogsUpserted: 0,
      ownersUpserted: 0,
      ownershipsUpserted: 0,
      trialResultsUpserted: 2,
      showResultsUpserted: 0,
      errorsCount: 0,
      startedAt: new Date("2024-01-01T00:00:00.000Z"),
      finishedAt: new Date("2024-01-01T00:00:01.000Z"),
      errorSummary: null,
      createdByUserId: "user-1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:01.000Z"),
      issuesCount: 0,
    });
    fetchLegacyTrialMirrorRowsMock.mockResolvedValue({
      ...emptyRows,
      akoeall: [
        {
          rekno: "FI1/24",
          tappa: "Oulu",
          tappv: "20240101",
          muokattuRaw: "2024-01-01 12:00:00",
          rawPayloadJson: "{}",
        },
      ],
      bealt: [
        {
          rekno: "FI1/24",
          tappa: "Oulu",
          tappv: "20240101",
          era: 1,
          muokattuRaw: "0000-00-00 00:00:00",
          rawPayloadJson: "{}",
        },
      ],
    });
    upsertLegacyTrialMirrorRowsDbMock.mockResolvedValue(counts);
    countLegacyTrialMirrorRowsDbMock.mockResolvedValue(counts);
  });

  it("imports legacy trial rows into mirror tables only", async () => {
    const result = await runLegacyPhase2("user-1");

    expect(result.status).toBe(202);
    expect(createImportRunMock).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "LEGACY_TRIAL_MIRROR",
        createdByUserId: "user-1",
      }),
    );
    expect(upsertLegacyTrialMirrorRowsDbMock).toHaveBeenCalled();
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-2",
      expect.objectContaining({
        status: "SUCCEEDED",
        trialResultsUpserted: 2,
        errorsCount: 0,
        errorSummary: expect.stringContaining("mirrorRows=2"),
      }),
      expect.any(Object),
    );
  });

  it("fails validation when source and mirror counts differ", async () => {
    countLegacyTrialMirrorRowsDbMock.mockResolvedValue({
      ...counts,
      bealt: 0,
    });
    markImportRunFinishedMock.mockResolvedValueOnce({
      id: "run-2",
      kind: "LEGACY_TRIAL_MIRROR",
      status: "FAILED",
      dogsUpserted: 0,
      ownersUpserted: 0,
      ownershipsUpserted: 0,
      trialResultsUpserted: 2,
      showResultsUpserted: 0,
      errorsCount: 1,
      startedAt: new Date("2024-01-01T00:00:00.000Z"),
      finishedAt: new Date("2024-01-01T00:00:01.000Z"),
      errorSummary: null,
      createdByUserId: "user-1",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:01.000Z"),
      issuesCount: 1,
    });

    const result = await runLegacyPhase2("user-1");

    expect(result.status).toBe(500);
    expect(result.body.ok).toBe(false);
    expect(createImportRunIssuesBulkMock).toHaveBeenCalledWith(
      "run-2",
      expect.arrayContaining([
        expect.objectContaining({
          stage: "validate-mirror",
          severity: "ERROR",
          code: "TRIAL_MIRROR_COUNT_MISMATCH",
        }),
      ]),
      expect.any(Object),
    );
  });

  it("marks run failed when mirror upsert throws unexpectedly", async () => {
    upsertLegacyTrialMirrorRowsDbMock.mockRejectedValue(new Error("boom"));
    markImportRunFinishedMock.mockResolvedValueOnce({
      id: "run-2",
    });

    const result = await runLegacyPhase2("user-1");

    expect(result.status).toBe(500);
    expect(createImportRunIssueMock).toHaveBeenCalledWith(
      "run-2",
      expect.objectContaining({
        stage: "run",
        code: "UNEXPECTED_EXCEPTION",
      }),
      expect.any(Object),
    );
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-2",
      expect.objectContaining({
        status: "FAILED",
      }),
      expect.any(Object),
    );
  });
});
