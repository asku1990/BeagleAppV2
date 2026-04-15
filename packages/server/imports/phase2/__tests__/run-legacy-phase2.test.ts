import { beforeEach, describe, expect, it, vi } from "vitest";
import { runLegacyPhase2 } from "../run-legacy-phase2";

const {
  createImportRunMock,
  markImportRunRunningMock,
  markImportRunFinishedMock,
  createImportRunIssueMock,
  createImportRunIssuesBulkMock,
  countTrialEntryRowsDbMock,
  fetchLegacyTrialRowsMock,
  listPhase2DogRegistrationsDbMock,
  upsertCanonicalTrialRowsMock,
} = vi.hoisted(() => ({
  createImportRunMock: vi.fn(),
  markImportRunRunningMock: vi.fn(),
  markImportRunFinishedMock: vi.fn(),
  createImportRunIssueMock: vi.fn(),
  createImportRunIssuesBulkMock: vi.fn(),
  countTrialEntryRowsDbMock: vi.fn(),
  fetchLegacyTrialRowsMock: vi.fn(),
  listPhase2DogRegistrationsDbMock: vi.fn(),
  upsertCanonicalTrialRowsMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  ImportKind: {
    LEGACY_PHASE2: "LEGACY_PHASE2",
  },
  createImportRun: createImportRunMock,
  markImportRunRunning: markImportRunRunningMock,
  markImportRunFinished: markImportRunFinishedMock,
  createImportRunIssue: createImportRunIssueMock,
  createImportRunIssuesBulk: createImportRunIssuesBulkMock,
  countTrialEntryRowsDb: countTrialEntryRowsDbMock,
  fetchLegacyTrialRows: fetchLegacyTrialRowsMock,
  listPhase2DogRegistrationsDb: listPhase2DogRegistrationsDbMock,
}));

vi.mock("../../internal", () => ({
  upsertCanonicalTrialRows: upsertCanonicalTrialRowsMock,
}));

describe("runLegacyPhase2", () => {
  beforeEach(() => {
    createImportRunMock.mockReset();
    markImportRunRunningMock.mockReset();
    markImportRunFinishedMock.mockReset();
    createImportRunIssueMock.mockReset();
    createImportRunIssuesBulkMock.mockReset();
    countTrialEntryRowsDbMock.mockReset();
    fetchLegacyTrialRowsMock.mockReset();
    listPhase2DogRegistrationsDbMock.mockReset();
    upsertCanonicalTrialRowsMock.mockReset();

    createImportRunMock.mockResolvedValue({ id: "run-2" });
    markImportRunRunningMock.mockResolvedValue(undefined);
    markImportRunFinishedMock.mockResolvedValue({
      id: "run-2",
      kind: "LEGACY_PHASE2",
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
    fetchLegacyTrialRowsMock.mockResolvedValue([]);
    listPhase2DogRegistrationsDbMock.mockResolvedValue([]);
    countTrialEntryRowsDbMock.mockResolvedValue(12);
    upsertCanonicalTrialRowsMock.mockResolvedValue({
      upserted: 2,
      errors: 0,
      issues: [],
    });
  });

  it("runs canonical phase2 import and stores comparison counters", async () => {
    const result = await runLegacyPhase2("user-1");

    expect(result.status).toBe(202);
    expect(upsertCanonicalTrialRowsMock).toHaveBeenCalled();
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-2",
      expect.objectContaining({
        status: "SUCCEEDED",
        trialResultsUpserted: 2,
        errorsCount: 0,
        errorSummary: expect.stringContaining("canonicalTrialEntry=12"),
      }),
      expect.any(Object),
    );
  });

  it("preserves INFO severity from canonical trial issues", async () => {
    upsertCanonicalTrialRowsMock.mockResolvedValue({
      upserted: 1,
      errors: 0,
      issues: [
        {
          severity: "INFO",
          code: "TRIAL_CANONICAL_UNMAPPED_FIELDS",
          message: "some fields are not mapped",
          registrationNo: "FI-1/24",
          sourceTable: "akoeall",
          payloadJson: '{"yva":"7.0"}',
        },
      ],
    });

    const result = await runLegacyPhase2("user-1");

    expect(result.status).toBe(202);
    expect(createImportRunIssuesBulkMock).toHaveBeenCalledWith(
      "run-2",
      expect.arrayContaining([
        expect.objectContaining({
          stage: "trials",
          severity: "INFO",
          code: "TRIAL_CANONICAL_UNMAPPED_FIELDS",
        }),
      ]),
      expect.any(Object),
    );
  });

  it("marks run failed when canonical upsert throws unexpectedly", async () => {
    upsertCanonicalTrialRowsMock.mockRejectedValue(new Error("boom"));
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
