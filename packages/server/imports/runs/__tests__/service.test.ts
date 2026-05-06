import { beforeEach, describe, expect, it, vi } from "vitest";
import { createImportsService } from "../service";

const {
  runLegacyPhase1Mock,
  runLegacyPhase1_5Mock,
  runLegacyPhase2Mock,
  runLegacyPhase3Mock,
  getImportRunByIdMock,
  listImportRunIssuesMock,
  isInvalidImportRunIssuesCursorErrorMock,
} = vi.hoisted(() => ({
  runLegacyPhase1Mock: vi.fn(),
  runLegacyPhase1_5Mock: vi.fn(),
  runLegacyPhase2Mock: vi.fn(),
  runLegacyPhase3Mock: vi.fn(),
  getImportRunByIdMock: vi.fn(),
  listImportRunIssuesMock: vi.fn(),
  isInvalidImportRunIssuesCursorErrorMock: vi.fn(),
}));

vi.mock("../../phase1", () => ({
  runLegacyPhase1: runLegacyPhase1Mock,
}));

vi.mock("../../phase2", () => ({
  runLegacyPhase2: runLegacyPhase2Mock,
}));

vi.mock("../../phase1_5", () => ({
  runLegacyPhase1_5: runLegacyPhase1_5Mock,
}));

vi.mock("../../phase3", () => ({
  runLegacyPhase3: runLegacyPhase3Mock,
}));

vi.mock("@beagle/db", () => ({
  getImportRunById: getImportRunByIdMock,
  listImportRunIssues: listImportRunIssuesMock,
  isInvalidImportRunIssuesCursorError: isInvalidImportRunIssuesCursorErrorMock,
}));

describe("imports runs service", () => {
  beforeEach(() => {
    runLegacyPhase1Mock.mockReset();
    runLegacyPhase1_5Mock.mockReset();
    runLegacyPhase2Mock.mockReset();
    runLegacyPhase3Mock.mockReset();
    getImportRunByIdMock.mockReset();
    listImportRunIssuesMock.mockReset();
    isInvalidImportRunIssuesCursorErrorMock.mockReset();
    isInvalidImportRunIssuesCursorErrorMock.mockReturnValue(false);
  });

  it("delegates runLegacyPhase1 to phase1 runner", async () => {
    const expected = {
      status: 202,
      body: { ok: true, data: { id: "run-1", kind: "LEGACY_PHASE1" } },
    };
    runLegacyPhase1Mock.mockResolvedValue(expected);

    const service = createImportsService();
    const log = vi.fn();
    const result = await service.runLegacyPhase1("user-1", {
      log,
      auditSource: "SCRIPT",
    });

    expect(runLegacyPhase1Mock).toHaveBeenCalledWith("user-1", {
      log,
      auditSource: "SCRIPT",
    });
    expect(result).toEqual(expected);
  });

  it("delegates runLegacyPhase2 to phase2 runner", async () => {
    const expected = {
      status: 202,
      body: { ok: true, data: { id: "run-2", kind: "LEGACY_TRIAL_MIRROR" } },
    };
    runLegacyPhase2Mock.mockResolvedValue(expected);

    const service = createImportsService();
    const result = await service.runLegacyPhase2("user-2");

    expect(runLegacyPhase2Mock).toHaveBeenCalledWith("user-2", undefined);
    expect(result).toEqual(expected);
  });

  it("delegates runLegacyPhase1_5 to phase1_5 runner", async () => {
    const expected = {
      status: 202,
      body: { ok: true, data: { id: "run-15", kind: "LEGACY_PHASE1_5" } },
    };
    runLegacyPhase1_5Mock.mockResolvedValue(expected);

    const service = createImportsService();
    const result = await service.runLegacyPhase1_5("user-15");

    expect(runLegacyPhase1_5Mock).toHaveBeenCalledWith("user-15", undefined);
    expect(result).toEqual(expected);
  });

  it("delegates runLegacyPhase3 to phase3 runner", async () => {
    const expected = {
      status: 202,
      body: { ok: true, data: { id: "run-3", kind: "LEGACY_PHASE3" } },
    };
    runLegacyPhase3Mock.mockResolvedValue(expected);

    const service = createImportsService();
    const result = await service.runLegacyPhase3();

    expect(runLegacyPhase3Mock).toHaveBeenCalledWith(undefined, undefined);
    expect(result).toEqual(expected);
  });

  it("returns 404 when import run is missing", async () => {
    getImportRunByIdMock.mockResolvedValue(null);
    const service = createImportsService();

    const result = await service.getImportRun("missing-run");

    expect(result).toEqual({
      status: 404,
      body: { ok: false, error: "Import run not found." },
    });
  });

  it("maps import run to API response", async () => {
    getImportRunByIdMock.mockResolvedValue({
      id: "run-1",
      kind: "LEGACY_PHASE1",
      status: "SUCCEEDED",
      dogsUpserted: 1,
      ownersUpserted: 2,
      ownershipsUpserted: 3,
      trialResultsUpserted: 4,
      showResultsUpserted: 5,
      errorsCount: 0,
      startedAt: new Date("2025-01-01T00:00:00.000Z"),
      finishedAt: new Date("2025-01-01T01:00:00.000Z"),
      errorSummary: null,
      createdByUserId: "user-1",
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      updatedAt: new Date("2025-01-01T01:00:00.000Z"),
      issuesCount: 7,
    });
    const service = createImportsService();

    const result = await service.getImportRun("run-1");

    expect(result.status).toBe(200);
    expect(result).toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          id: "run-1",
          kind: "LEGACY_PHASE1",
          status: "SUCCEEDED",
          dogsUpserted: 1,
          ownersUpserted: 2,
          ownershipsUpserted: 3,
          trialResultsUpserted: 4,
          showResultsUpserted: 5,
          errorsCount: 0,
          startedAt: "2025-01-01T00:00:00.000Z",
          finishedAt: "2025-01-01T01:00:00.000Z",
          errorSummary: null,
          createdByUserId: "user-1",
          createdAt: "2025-01-01T00:00:00.000Z",
          updatedAt: "2025-01-01T01:00:00.000Z",
          issuesCount: 7,
        },
      },
    });
  });

  it("returns 404 for issues when run is missing", async () => {
    getImportRunByIdMock.mockResolvedValue(null);
    const service = createImportsService();

    const result = await service.getImportRunIssues("missing-run");

    expect(result).toEqual({
      status: 404,
      body: { ok: false, error: "Import run not found." },
    });
    expect(listImportRunIssuesMock).not.toHaveBeenCalled();
  });

  it("maps issue list response", async () => {
    getImportRunByIdMock.mockResolvedValue({
      id: "run-1",
    });
    listImportRunIssuesMock.mockResolvedValue({
      items: [
        {
          id: "issue-1",
          importRunId: "run-1",
          stage: "dogs",
          severity: "WARNING",
          code: "DOG_MISSING_REQUIRED_FIELDS",
          message: "Dog row missing registration number or name.",
          registrationNo: null,
          sourceRowId: null,
          sourceTable: "bearek_id",
          payloadJson: '{"x":1}',
          createdAt: new Date("2025-01-01T00:00:00.000Z"),
        },
      ],
      nextCursor: "cursor-2",
    });
    const service = createImportsService();

    const result = await service.getImportRunIssues("run-1", {
      stage: "dogs",
      limit: 10,
      cursor: "cursor-1",
    });

    expect(listImportRunIssuesMock).toHaveBeenCalledWith("run-1", {
      stage: "dogs",
      limit: 10,
      cursor: "cursor-1",
    });
    expect(result).toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          items: [
            {
              id: "issue-1",
              importRunId: "run-1",
              stage: "dogs",
              severity: "WARNING",
              code: "DOG_MISSING_REQUIRED_FIELDS",
              message: "Dog row missing registration number or name.",
              registrationNo: null,
              sourceRowId: null,
              sourceTable: "bearek_id",
              payloadJson: '{"x":1}',
              createdAt: "2025-01-01T00:00:00.000Z",
            },
          ],
          nextCursor: "cursor-2",
        },
      },
    });
  });

  it("returns 400 for invalid issues cursor", async () => {
    getImportRunByIdMock.mockResolvedValue({
      id: "run-1",
    });
    const invalidCursorError = new Error("invalid cursor");
    listImportRunIssuesMock.mockRejectedValue(invalidCursorError);
    isInvalidImportRunIssuesCursorErrorMock.mockReturnValue(true);
    const service = createImportsService();

    const result = await service.getImportRunIssues("run-1", {
      cursor: "bad",
    });

    expect(result).toEqual({
      status: 400,
      body: { ok: false, error: "Invalid cursor." },
    });
  });

  it("rethrows unknown issue list errors", async () => {
    getImportRunByIdMock.mockResolvedValue({
      id: "run-1",
    });
    const unknownError = new Error("boom");
    listImportRunIssuesMock.mockRejectedValue(unknownError);
    isInvalidImportRunIssuesCursorErrorMock.mockReturnValue(false);
    const service = createImportsService();

    await expect(service.getImportRunIssues("run-1")).rejects.toThrow("boom");
  });
});
