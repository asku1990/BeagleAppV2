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
  dogRegistrationCreateMock,
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
  dogRegistrationCreateMock: vi.fn(),
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
      create: dogRegistrationCreateMock,
      update: dogRegistrationUpdateMock,
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
    dogRegistrationCreateMock.mockReset();
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
    dogRegistrationCreateMock.mockResolvedValue({
      id: "registration-1",
    });
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
    expect(dogUpdateMock.mock.calls).toEqual(
      expect.arrayContaining([
        [
          {
            where: { id: "dog-1" },
            data: { ekNo: 5588 },
          },
        ],
      ]),
    );
    expect(
      dogUpdateMock.mock.calls.some(
        ([call]) => "ekNo" in call.data && call.data.ekNo === 0,
      ),
    ).toBe(false);
    expect(createImportRunIssuesBulkMock).not.toHaveBeenCalled();
    expect(createImportRunIssueMock).not.toHaveBeenCalled();
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({
        status: "SUCCEEDED",
        errorsCount: 0,
        errorSummary: expect.stringContaining("Phase 1:"),
      }),
      expect.any(Object),
    );
  });

  it("explains that missing KNIMI prevented the dog from being imported and linked", async () => {
    fetchLegacyPhase1RowsMock.mockResolvedValue({
      dogs: [
        {
          registrationNo: "S87477",
          name: null,
          sex: "N",
          birthDateRaw: null,
          sireRegistrationNo: null,
          damRegistrationNo: null,
          breederName: null,
        },
      ],
      breeders: [],
      eks: [],
      owners: [],
      samakoira: [],
    });
    dogRegistrationFindManyMock.mockResolvedValue([
      { registrationNo: "FI12345/21", dogId: "dog-1" },
    ]);

    const result = await runLegacyPhase1("user-1");

    expect(result.status).toBe(202);
    expect(dogCreateMock).not.toHaveBeenCalled();
    expect(createImportRunIssuesBulkMock).toHaveBeenCalledWith(
      "run-1",
      expect.arrayContaining([
        expect.objectContaining({
          stage: "dogs",
          code: "DOG_MISSING_REQUIRED_FIELDS",
          message: "Dog row missing registration number or name.",
          registrationNo: "S87477",
          sourceTable: "bearek_id",
        }),
        expect.objectContaining({
          stage: "relations",
          code: "RELATION_DOG_NOT_FOUND",
          message:
            "Dog was not found in the imported dogs index because the source row was skipped earlier due to blank KNIMI, so sire/dam relations were not created.",
          registrationNo: "S87477",
          sourceTable: "bearek_id",
        }),
      ]),
      expect.any(Object),
    );
  });

  it("describes placeholder parent registrations as unknown and excluded from the new database", async () => {
    fetchLegacyPhase1RowsMock.mockResolvedValue({
      dogs: [
        {
          registrationNo: "FI12345/21",
          name: "Aino",
          sex: "U",
          birthDateRaw: "20240101",
          sireRegistrationNo: null,
          damRegistrationNo: "U000000",
          breederName: null,
        },
      ],
      breeders: [],
      eks: [],
      owners: [],
      samakoira: [],
    });
    dogRegistrationFindManyMock.mockResolvedValue([
      { registrationNo: "FI12345/21", dogId: "dog-1" },
    ]);

    const result = await runLegacyPhase1("user-1");

    expect(result.status).toBe(202);
    expect(createImportRunIssuesBulkMock).toHaveBeenCalledWith(
      "run-1",
      expect.arrayContaining([
        expect.objectContaining({
          stage: "relations",
          severity: "INFO",
          code: "RELATION_DAM_PLACEHOLDER",
          message:
            "Dam registration is a placeholder and was treated as unknown, so the placeholder reference was not written to the new database.",
          registrationNo: "FI12345/21",
          sourceTable: "bearek_id",
        }),
      ]),
      expect.any(Object),
    );
    expect(createImportRunIssueMock).not.toHaveBeenCalled();
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({
        status: "SUCCEEDED",
        errorsCount: 0,
        errorSummary: expect.stringContaining("Phase 1:"),
      }),
      expect.any(Object),
    );
  });

  it("skips a null EK row without writing an EK value", async () => {
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
      eks: [{ registrationNo: "FI12345/21", ekNo: null }],
      owners: [],
      samakoira: [],
    });

    const result = await runLegacyPhase1("user-1");

    expect(result.status).toBe(202);
    expect(
      dogUpdateMock.mock.calls.filter(([call]) => "ekNo" in call.data),
    ).toHaveLength(0);
    expect(createImportRunIssuesBulkMock).not.toHaveBeenCalled();
    expect(createImportRunIssueMock).not.toHaveBeenCalled();
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({
        status: "SUCCEEDED",
        errorsCount: 0,
        errorSummary: expect.stringContaining("Phase 1:"),
      }),
      expect.any(Object),
    );
  });

  it("does not record an issue for an empty REK_3 alias slot", async () => {
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
      eks: [],
      owners: [],
      samakoira: [
        {
          rek1: "FI12345/21",
          rek2: "FI99999/21",
          rek3: null,
        },
      ],
    });
    dogRegistrationFindUniqueMock.mockImplementation(({ where, select }) => {
      if (select?.source) {
        return Promise.resolve(null);
      }
      if (where?.registrationNo === "FI99999/21") {
        return Promise.resolve(null);
      }
      return Promise.resolve({ dogId: "dog-1" });
    });

    const result = await runLegacyPhase1("user-1");

    expect(result.status).toBe(202);
    expect(dogRegistrationCreateMock).toHaveBeenCalledWith({
      data: {
        dogId: "dog-1",
        registrationNo: "FI99999/21",
        source: "LEGACY_SAMAKOIRA",
      },
    });
    expect(createImportRunIssuesBulkMock).not.toHaveBeenCalled();
    expect(createImportRunIssueMock).not.toHaveBeenCalled();
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({
        status: "SUCCEEDED",
        errorsCount: 0,
        errorSummary: expect.stringContaining("Phase 1:"),
      }),
      expect.any(Object),
    );
  });

  it("records an empty REK_2 alias slot as a warning", async () => {
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
      eks: [],
      owners: [],
      samakoira: [
        {
          rek1: "FI12345/21",
          rek2: null,
          rek3: null,
        },
      ],
    });
    dogRegistrationFindUniqueMock.mockImplementation(({ where, select }) => {
      if (select?.source) {
        return Promise.resolve(null);
      }
      if (where?.registrationNo === "FI12345/21") {
        return Promise.resolve({ dogId: "dog-1" });
      }
      return Promise.resolve(null);
    });

    const result = await runLegacyPhase1("user-1");

    expect(result.status).toBe(202);
    expect(createImportRunIssuesBulkMock).toHaveBeenCalledWith(
      "run-1",
      expect.arrayContaining([
        expect.objectContaining({
          stage: "samakoira",
          severity: "WARNING",
          code: "SAMAKOIRA_ALIAS_EMPTY",
          registrationNo: "FI12345/21",
          sourceTable: "samakoira",
        }),
      ]),
      expect.any(Object),
    );
    expect(createImportRunIssueMock).not.toHaveBeenCalled();
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({
        status: "SUCCEEDED",
        errorsCount: 0,
        errorSummary: expect.stringContaining("Phase 1:"),
      }),
      expect.any(Object),
    );
  });
});
