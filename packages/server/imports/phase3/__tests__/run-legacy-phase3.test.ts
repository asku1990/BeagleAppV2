import { beforeEach, describe, expect, it, vi } from "vitest";
import { runLegacyPhase3 } from "../run-legacy-phase3";

const {
  createImportRunMock,
  markImportRunRunningMock,
  markImportRunFinishedMock,
  createImportRunIssueMock,
  createImportRunIssuesBulkMock,
  fetchLegacyShowRowsMock,
  getShowTokenCoverageReportMock,
  upsertShowRowsMock,
  showEventCountMock,
  showEntryCountMock,
  showResultItemCountMock,
} = vi.hoisted(() => ({
  createImportRunMock: vi.fn(),
  markImportRunRunningMock: vi.fn(),
  markImportRunFinishedMock: vi.fn(),
  createImportRunIssueMock: vi.fn(),
  createImportRunIssuesBulkMock: vi.fn(),
  fetchLegacyShowRowsMock: vi.fn(),
  getShowTokenCoverageReportMock: vi.fn(),
  upsertShowRowsMock: vi.fn(),
  showEventCountMock: vi.fn(),
  showEntryCountMock: vi.fn(),
  showResultItemCountMock: vi.fn(),
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
    dogRegistration: { findMany: vi.fn() },
  },
}));

vi.mock("../../internal", () => ({
  getShowTokenCoverageReport: getShowTokenCoverageReportMock,
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
    getShowTokenCoverageReportMock.mockReset();
    upsertShowRowsMock.mockReset();
    showEventCountMock.mockReset();
    showEntryCountMock.mockReset();
    showResultItemCountMock.mockReset();

    createImportRunMock.mockResolvedValue({ id: "run-1" });
    markImportRunRunningMock.mockResolvedValue(undefined);
    markImportRunFinishedMock.mockResolvedValue({ id: "run-1" });
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
    expect(getShowTokenCoverageReportMock).not.toHaveBeenCalled();
    expect(upsertShowRowsMock).not.toHaveBeenCalled();
  });
});
