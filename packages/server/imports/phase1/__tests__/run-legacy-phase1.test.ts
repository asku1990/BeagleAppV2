import { beforeEach, describe, expect, it, vi } from "vitest";
import { runLegacyPhase1 } from "../run-legacy-phase1";

const {
  createImportRunMock,
  markImportRunRunningMock,
  markImportRunFinishedMock,
  createImportRunIssueMock,
  createImportRunIssuesBulkMock,
  fetchLegacyPhase1RowsMock,
  seedDogColorsDbMock,
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
  seedDogColorsDbMock: vi.fn(),
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
  DogStatus: {
    NORMAL: "NORMAL",
    REFERENCE_ONLY: "REFERENCE_ONLY",
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
  seedDogColorsDb: seedDogColorsDbMock,
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
    seedDogColorsDbMock.mockReset();
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
    seedDogColorsDbMock.mockResolvedValue({ codes: [121, 539, 886] });

    breederFindManyMock.mockResolvedValue([]);
    dogRegistrationFindUniqueMock.mockImplementation(({ select }) => {
      if (select?.source) {
        return Promise.resolve(null);
      }
      return Promise.resolve({ dogId: "dog-1" });
    });
    dogRegistrationFindManyMock.mockResolvedValue([
      {
        registrationNo: "FI12345/21",
        dogId: "dog-1",
        dog: { sex: "MALE" },
      },
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

  it("warns for every dog sex other than U and N while preserving mapped values", async () => {
    fetchLegacyPhase1RowsMock.mockResolvedValue({
      dogs: [
        {
          registrationNo: "FI12345/21",
          name: "Invalid sex",
          sex: "X",
          birthDateRaw: null,
          sireRegistrationNo: null,
          damRegistrationNo: null,
          breederName: null,
          colorCode: null,
        },
        {
          registrationNo: "FI54321/21",
          name: "Blank sex",
          sex: " ",
          birthDateRaw: null,
          sireRegistrationNo: null,
          damRegistrationNo: null,
          breederName: null,
          colorCode: null,
        },
        {
          registrationNo: "FI99999/21",
          name: "Null sex",
          sex: null,
          birthDateRaw: null,
          sireRegistrationNo: null,
          damRegistrationNo: null,
          breederName: null,
          colorCode: null,
        },
        {
          registrationNo: "FI11111/21",
          name: "Male",
          sex: "U",
          birthDateRaw: null,
          sireRegistrationNo: null,
          damRegistrationNo: null,
          breederName: null,
          colorCode: null,
        },
        {
          registrationNo: "FI22222/21",
          name: "Female",
          sex: "N",
          birthDateRaw: null,
          sireRegistrationNo: null,
          damRegistrationNo: null,
          breederName: null,
          colorCode: null,
        },
      ],
      breeders: [],
      eks: [],
      owners: [],
      samakoira: [],
    });
    dogRegistrationFindManyMock.mockResolvedValue([
      {
        registrationNo: "FI12345/21",
        dogId: "dog-1",
        dog: { sex: "UNKNOWN" },
      },
      {
        registrationNo: "FI54321/21",
        dogId: "dog-2",
        dog: { sex: "UNKNOWN" },
      },
      {
        registrationNo: "FI99999/21",
        dogId: "dog-3",
        dog: { sex: "UNKNOWN" },
      },
      {
        registrationNo: "FI11111/21",
        dogId: "dog-4",
        dog: { sex: "MALE" },
      },
      {
        registrationNo: "FI22222/21",
        dogId: "dog-5",
        dog: { sex: "FEMALE" },
      },
    ]);

    await runLegacyPhase1("user-1");

    expect(dogCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Invalid sex", sex: "UNKNOWN" }),
      }),
    );
    expect(dogCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Blank sex", sex: "UNKNOWN" }),
      }),
    );
    expect(dogCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Null sex", sex: "UNKNOWN" }),
      }),
    );
    expect(dogCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Male", sex: "MALE" }),
      }),
    );
    expect(dogCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ name: "Female", sex: "FEMALE" }),
      }),
    );

    const issues = createImportRunIssuesBulkMock.mock.calls.flatMap(
      ([, nextIssues]) => nextIssues,
    );
    const sexIssues = issues.filter(
      (issue) => issue.code === "DOG_SEX_INVALID_VALUE",
    );
    expect(sexIssues).toEqual([
      expect.objectContaining({
        stage: "dogs",
        severity: "WARNING",
        registrationNo: "FI12345/21",
        sourceTable: "bearek_id",
      }),
      expect.objectContaining({
        stage: "dogs",
        severity: "WARNING",
        registrationNo: "FI54321/21",
        sourceTable: "bearek_id",
      }),
      expect.objectContaining({
        stage: "dogs",
        severity: "WARNING",
        registrationNo: "FI99999/21",
        sourceTable: "bearek_id",
      }),
    ]);
    expect(
      sexIssues.map((issue) => JSON.parse(issue.payloadJson ?? "{}")),
    ).toEqual([
      { registrationNo: "FI12345/21", rawSex: "X" },
      { registrationNo: "FI54321/21", rawSex: " " },
      { registrationNo: "FI99999/21", rawSex: null },
    ]);
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({ errorsCount: 0 }),
      expect.any(Object),
    );
  });

  it("links a dog to a seeded legacy placeholder color", async () => {
    seedDogColorsDbMock.mockResolvedValue({ codes: [391] });
    fetchLegacyPhase1RowsMock.mockResolvedValue({
      dogs: [
        {
          registrationNo: "FI12345/21",
          name: "Aino",
          sex: "N",
          birthDateRaw: "20240101",
          sireRegistrationNo: null,
          damRegistrationNo: null,
          breederName: null,
          colorCode: 391,
        },
      ],
      breeders: [],
      eks: [],
      owners: [],
      samakoira: [],
    });

    await runLegacyPhase1("user-1");

    expect(dogCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ colorCode: 391 }),
      }),
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
      {
        registrationNo: "FI12345/21",
        dogId: "dog-1",
        dog: { sex: "FEMALE" },
      },
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
      {
        registrationNo: "FI12345/21",
        dogId: "dog-1",
        dog: { sex: "MALE" },
      },
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

  it.each([
    {
      caseName: "warns for unknown sire and dam sexes",
      sireSex: "UNKNOWN",
      damSex: "UNKNOWN",
      expectedCodes: [
        "RELATION_SIRE_SEX_MISMATCH",
        "RELATION_DAM_SEX_MISMATCH",
      ],
    },
    {
      caseName: "warns for opposite sire and dam sexes",
      sireSex: "FEMALE",
      damSex: "MALE",
      expectedCodes: [
        "RELATION_SIRE_SEX_MISMATCH",
        "RELATION_DAM_SEX_MISMATCH",
      ],
    },
    {
      caseName: "does not warn for valid sire and dam sexes",
      sireSex: "MALE",
      damSex: "FEMALE",
      expectedCodes: [],
    },
  ])("$caseName", async ({ sireSex, damSex, expectedCodes }) => {
    const toLegacySex = (sex: string) => {
      if (sex === "MALE") return "U";
      if (sex === "FEMALE") return "N";
      return null;
    };
    fetchLegacyPhase1RowsMock.mockResolvedValue({
      dogs: [
        {
          registrationNo: "FI10000/21",
          name: "Child",
          sex: "N",
          birthDateRaw: null,
          sireRegistrationNo: "FI20000/19",
          damRegistrationNo: "FI30000/19",
          breederName: null,
          colorCode: null,
        },
        {
          registrationNo: "FI20000/19",
          name: "Sire",
          sex: toLegacySex(sireSex),
          birthDateRaw: null,
          sireRegistrationNo: null,
          damRegistrationNo: null,
          breederName: null,
          colorCode: null,
        },
        {
          registrationNo: "FI30000/19",
          name: "Dam",
          sex: toLegacySex(damSex),
          birthDateRaw: null,
          sireRegistrationNo: null,
          damRegistrationNo: null,
          breederName: null,
          colorCode: null,
        },
      ],
      breeders: [],
      eks: [],
      owners: [],
      samakoira: [],
    });
    dogRegistrationFindManyMock.mockResolvedValue([
      {
        registrationNo: "FI10000/21",
        dogId: "child",
        dog: { sex: "FEMALE" },
      },
      {
        registrationNo: "FI20000/19",
        dogId: "sire",
        dog: { sex: sireSex },
      },
      {
        registrationNo: "FI30000/19",
        dogId: "dam",
        dog: { sex: damSex },
      },
    ]);
    dogCreateMock.mockImplementation(({ data }) =>
      Promise.resolve({
        id:
          data.name === "Child"
            ? "child"
            : data.name === "Sire"
              ? "sire"
              : "dam",
      }),
    );

    await runLegacyPhase1("user-1");

    const issues = createImportRunIssuesBulkMock.mock.calls.flatMap(
      ([, nextIssues]) => nextIssues,
    );
    const sexMismatchIssues = issues.filter((issue) =>
      issue.code.endsWith("_SEX_MISMATCH"),
    );
    expect(sexMismatchIssues.map((issue) => issue.code)).toEqual(expectedCodes);

    const sireIssue = sexMismatchIssues.find(
      (issue) => issue.code === "RELATION_SIRE_SEX_MISMATCH",
    );
    if (sireIssue) {
      expect(sireIssue).toEqual(
        expect.objectContaining({
          stage: "relations",
          severity: "WARNING",
          registrationNo: "FI10000/21",
          sourceTable: "bearek_id",
        }),
      );
      expect(JSON.parse(sireIssue.payloadJson ?? "{}")).toEqual({
        childRegistrationNo: "FI10000/21",
        parentRegistrationNo: "FI20000/19",
        parentDogId: "sire",
        actualSex: sireSex,
        expectedSex: "MALE",
      });
    }

    const damIssue = sexMismatchIssues.find(
      (issue) => issue.code === "RELATION_DAM_SEX_MISMATCH",
    );
    if (damIssue) {
      expect(damIssue).toEqual(
        expect.objectContaining({
          stage: "relations",
          severity: "WARNING",
          registrationNo: "FI10000/21",
          sourceTable: "bearek_id",
        }),
      );
      expect(JSON.parse(damIssue.payloadJson ?? "{}")).toEqual({
        childRegistrationNo: "FI10000/21",
        parentRegistrationNo: "FI30000/19",
        parentDogId: "dam",
        actualSex: damSex,
        expectedSex: "FEMALE",
      });
    }

    expect(dogUpdateMock).toHaveBeenCalledWith({
      where: { id: "child" },
      data: { sireId: "sire", damId: "dam" },
    });
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({ errorsCount: 0 }),
      expect.any(Object),
    );
  });

  it("creates one reference-only sire, links every child, and records one review warning", async () => {
    fetchLegacyPhase1RowsMock.mockResolvedValue({
      dogs: [
        {
          registrationNo: "FI12345/21",
          name: "Aino",
          sex: "N",
          birthDateRaw: "20240101",
          sireRegistrationNo: "FI99999/19",
          damRegistrationNo: null,
          breederName: null,
          colorCode: null,
        },
        {
          registrationNo: "FI54321/21",
          name: "Bella",
          sex: "N",
          birthDateRaw: "20240202",
          sireRegistrationNo: "FI99999/19",
          damRegistrationNo: null,
          breederName: null,
          colorCode: null,
        },
      ],
      breeders: [],
      eks: [],
      owners: [],
      samakoira: [],
    });
    dogRegistrationFindManyMock.mockResolvedValue([
      {
        registrationNo: "FI12345/21",
        dogId: "dog-1",
        dog: { sex: "FEMALE" },
      },
      {
        registrationNo: "FI54321/21",
        dogId: "dog-2",
        dog: { sex: "FEMALE" },
      },
    ]);
    dogCreateMock.mockImplementation(({ data }) =>
      Promise.resolve({
        id:
          data.status === "REFERENCE_ONLY"
            ? "reference-sire"
            : data.name === "Bella"
              ? "dog-2"
              : "dog-1",
      }),
    );

    await runLegacyPhase1("user-1");

    expect(
      dogCreateMock.mock.calls.filter(
        ([call]) => call.data.status === "REFERENCE_ONLY",
      ),
    ).toEqual([
      [
        expect.objectContaining({
          data: expect.objectContaining({
            name: "FI99999/19",
            sex: "MALE",
            status: "REFERENCE_ONLY",
            registrations: {
              create: {
                registrationNo: "FI99999/19",
                source: "CANONICAL",
              },
            },
          }),
        }),
      ],
    ]);
    expect(dogUpdateMock).toHaveBeenCalledWith({
      where: { id: "dog-1" },
      data: { sireId: "reference-sire", damId: null },
    });
    expect(dogUpdateMock).toHaveBeenCalledWith({
      where: { id: "dog-2" },
      data: { sireId: "reference-sire", damId: null },
    });

    const issues = createImportRunIssuesBulkMock.mock.calls.flatMap(
      ([, nextIssues]) => nextIssues,
    );
    const createdIssue = issues.find(
      (issue) => issue.code === "RELATION_REFERENCE_ONLY_PARENT_CREATED",
    );
    expect(createdIssue).toEqual(
      expect.objectContaining({
        severity: "WARNING",
        registrationNo: "FI99999/19",
      }),
    );
    expect(JSON.parse(createdIssue?.payloadJson ?? "{}")).toEqual(
      expect.objectContaining({
        dogId: "reference-sire",
        parentRole: "sire",
        inferredSex: "MALE",
        referenceCount: 2,
        linkedChildrenCount: 2,
        usedRegistrationNameFallback: true,
      }),
    );
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({ dogsUpserted: 3, errorsCount: 0 }),
      expect.any(Object),
    );
  });

  it("reports an ambiguous missing parent once without creating or linking it", async () => {
    fetchLegacyPhase1RowsMock.mockResolvedValue({
      dogs: [
        {
          registrationNo: "FI12345/21",
          name: "Aino",
          sex: "N",
          birthDateRaw: null,
          sireRegistrationNo: "FI99999/19",
          damRegistrationNo: null,
          breederName: null,
          colorCode: null,
        },
        {
          registrationNo: "FI54321/21",
          name: "Bella",
          sex: "N",
          birthDateRaw: null,
          sireRegistrationNo: null,
          damRegistrationNo: "FI99999/19",
          breederName: null,
          colorCode: null,
        },
      ],
      breeders: [],
      eks: [],
      owners: [],
      samakoira: [],
    });
    dogRegistrationFindManyMock.mockResolvedValue([
      {
        registrationNo: "FI12345/21",
        dogId: "dog-1",
        dog: { sex: "FEMALE" },
      },
      {
        registrationNo: "FI54321/21",
        dogId: "dog-2",
        dog: { sex: "FEMALE" },
      },
    ]);

    await runLegacyPhase1("user-1");

    expect(
      dogCreateMock.mock.calls.some(
        ([call]) => call.data.status === "REFERENCE_ONLY",
      ),
    ).toBe(false);
    const issues = createImportRunIssuesBulkMock.mock.calls.flatMap(
      ([, nextIssues]) => nextIssues,
    );
    expect(
      issues.filter((issue) => issue.code === "RELATION_PARENT_ROLE_AMBIGUOUS"),
    ).toEqual([
      expect.objectContaining({
        severity: "ERROR",
        registrationNo: "FI99999/19",
      }),
    ]);
    expect(
      issues.some(
        (issue) =>
          issue.code === "RELATION_SIRE_NOT_FOUND" ||
          issue.code === "RELATION_DAM_NOT_FOUND",
      ),
    ).toBe(false);
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({ dogsUpserted: 2, errorsCount: 1 }),
      expect.any(Object),
    );
  });
});
