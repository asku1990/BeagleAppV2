import { beforeEach, describe, expect, it, vi } from "vitest";
import { runLegacyPhase1 } from "../run-legacy-phase1";

const {
  createImportRunMock,
  markImportRunRunningMock,
  markImportRunFinishedMock,
  createImportRunIssueMock,
  createImportRunIssuesBulkMock,
  fetchLegacyPhase1RowsMock,
  breederFindManyMock,
  dogRegistrationFindUniqueMock,
  dogRegistrationFindManyMock,
  dogRegistrationUpdateMock,
  dogCreateMock,
  dogUpdateMock,
  ownerFindFirstMock,
  ownerCreateMock,
  dogOwnershipCreateManyMock,
} = vi.hoisted(() => ({
  createImportRunMock: vi.fn(),
  markImportRunRunningMock: vi.fn(),
  markImportRunFinishedMock: vi.fn(),
  createImportRunIssueMock: vi.fn(),
  createImportRunIssuesBulkMock: vi.fn(),
  fetchLegacyPhase1RowsMock: vi.fn(),
  breederFindManyMock: vi.fn(),
  dogRegistrationFindUniqueMock: vi.fn(),
  dogRegistrationFindManyMock: vi.fn(),
  dogRegistrationUpdateMock: vi.fn(),
  dogCreateMock: vi.fn(),
  dogUpdateMock: vi.fn(),
  ownerFindFirstMock: vi.fn(),
  ownerCreateMock: vi.fn(),
  dogOwnershipCreateManyMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  DogSex: {
    MALE: "MALE",
    FEMALE: "FEMALE",
    UNKNOWN: "UNKNOWN",
  },
  ImportKind: {
    LEGACY_PHASE1: "LEGACY_PHASE1",
  },
  createImportRun: createImportRunMock,
  markImportRunRunning: markImportRunRunningMock,
  markImportRunFinished: markImportRunFinishedMock,
  createImportRunIssue: createImportRunIssueMock,
  createImportRunIssuesBulk: createImportRunIssuesBulkMock,
  fetchLegacyPhase1Rows: fetchLegacyPhase1RowsMock,
  prisma: {
    breeder: { findMany: breederFindManyMock },
    dogRegistration: {
      findUnique: dogRegistrationFindUniqueMock,
      findMany: dogRegistrationFindManyMock,
      update: dogRegistrationUpdateMock,
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    dog: {
      create: dogCreateMock,
      update: dogUpdateMock,
      findUnique: vi.fn(),
    },
    owner: {
      findFirst: ownerFindFirstMock,
      create: ownerCreateMock,
    },
    dogOwnership: {
      createMany: dogOwnershipCreateManyMock,
    },
    $transaction: vi.fn(),
  },
}));

describe("runLegacyPhase1", () => {
  beforeEach(() => {
    createImportRunMock.mockReset();
    markImportRunRunningMock.mockReset();
    markImportRunFinishedMock.mockReset();
    createImportRunIssueMock.mockReset();
    createImportRunIssuesBulkMock.mockReset();
    fetchLegacyPhase1RowsMock.mockReset();
    breederFindManyMock.mockReset();
    dogRegistrationFindUniqueMock.mockReset();
    dogRegistrationFindManyMock.mockReset();
    dogRegistrationUpdateMock.mockReset();
    dogCreateMock.mockReset();
    dogUpdateMock.mockReset();
    ownerFindFirstMock.mockReset();
    ownerCreateMock.mockReset();
    dogOwnershipCreateManyMock.mockReset();

    createImportRunMock.mockResolvedValue({ id: "run-1" });
    markImportRunRunningMock.mockResolvedValue(undefined);
    markImportRunFinishedMock.mockResolvedValue({
      id: "run-1",
      kind: "LEGACY_PHASE1",
      status: "SUCCEEDED",
      dogsUpserted: 1,
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
      issuesCount: 0,
    });

    fetchLegacyPhase1RowsMock.mockResolvedValue({
      dogs: [
        {
          registrationNo: "FI12345/21",
          name: "Aino",
          sex: "U",
          birthDateRaw: "20240101",
          sireRegistrationNo: null,
          damRegistrationNo: null,
          breederName: null,
        },
      ],
      breeders: [],
      eks: [
        { registrationNo: "FI12345/21", ekNo: 5588 },
        { registrationNo: "FI12345/21", ekNo: null },
      ],
      owners: [],
      samakoira: [],
    });

    breederFindManyMock.mockResolvedValue([]);
    dogRegistrationFindUniqueMock.mockImplementation(({ select }) => {
      if (select?.source) {
        return Promise.resolve(null);
      }
      return Promise.resolve({ dogId: "dog-1" });
    });
    dogRegistrationFindManyMock.mockResolvedValue([
      { registrationNo: "FI12345/21", dogId: "dog-1" },
    ]);
    dogRegistrationUpdateMock.mockResolvedValue(undefined);
    dogCreateMock.mockResolvedValue({ id: "dog-1" });
    dogUpdateMock.mockResolvedValue(undefined);
    ownerFindFirstMock.mockResolvedValue(null);
    ownerCreateMock.mockResolvedValue({ id: "owner-1" });
    dogOwnershipCreateManyMock.mockResolvedValue({ count: 0 });
  });

  it("updates EK values for valid rows and ignores null EK rows without recording issues", async () => {
    const result = await runLegacyPhase1("user-1");

    expect(result.status).toBe(202);
    expect(dogUpdateMock).toHaveBeenCalledWith({
      where: { id: "dog-1" },
      data: { ekNo: 5588 },
    });
    expect(createImportRunIssuesBulkMock).not.toHaveBeenCalled();
    expect(createImportRunIssueMock).not.toHaveBeenCalled();
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({
        status: "SUCCEEDED",
        errorsCount: 0,
        errorSummary: null,
      }),
      expect.any(Object),
    );
  });
});
