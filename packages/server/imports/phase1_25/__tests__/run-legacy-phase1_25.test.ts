import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createImportRunMock,
  markImportRunRunningMock,
  markImportRunFinishedMock,
  createImportRunIssueMock,
  createImportRunIssuesBulkMock,
  fetchLegacyPhase1_25RowsMock,
  dogRegistrationFindManyMock,
  sairausCreateManyMock,
  sairausFindManyMock,
  koiranSairausCreateManyMock,
  prismaMock,
} = vi.hoisted(() => {
  const createImportRunMock = vi.fn();
  const markImportRunRunningMock = vi.fn();
  const markImportRunFinishedMock = vi.fn();
  const createImportRunIssueMock = vi.fn();
  const createImportRunIssuesBulkMock = vi.fn();
  const fetchLegacyPhase1_25RowsMock = vi.fn();
  const dogRegistrationFindManyMock = vi.fn();
  const sairausCreateManyMock = vi.fn();
  const sairausFindManyMock = vi.fn();
  const koiranSairausCreateManyMock = vi.fn();
  const prismaMock = {
    dogRegistration: {
      findMany: dogRegistrationFindManyMock,
    },
    dog: {
      update: vi.fn(),
    },
    sairaus: {
      createMany: sairausCreateManyMock,
      findMany: sairausFindManyMock,
    },
    koiranSairaus: {
      createMany: koiranSairausCreateManyMock,
    },
  };
  return {
    createImportRunMock,
    markImportRunRunningMock,
    markImportRunFinishedMock,
    createImportRunIssueMock,
    createImportRunIssuesBulkMock,
    fetchLegacyPhase1_25RowsMock,
    dogRegistrationFindManyMock,
    sairausCreateManyMock,
    sairausFindManyMock,
    koiranSairausCreateManyMock,
    prismaMock,
  };
});

vi.mock("@beagle/db", () => ({
  ImportKind: {
    LEGACY_PHASE1_25: "LEGACY_PHASE1_25",
  },
  createImportRun: createImportRunMock,
  createImportRunIssue: createImportRunIssueMock,
  createImportRunIssuesBulk: createImportRunIssuesBulkMock,
  fetchLegacyPhase1_25Rows: fetchLegacyPhase1_25RowsMock,
  markImportRunFinished: markImportRunFinishedMock,
  markImportRunRunning: markImportRunRunningMock,
  prisma: prismaMock,
}));

import { runLegacyPhase1_25 } from "../run-legacy-phase1_25";

function makeLegacyRow(
  overrides: Partial<{
    legacyId: number;
    registrationNo: string | null;
    sireRegistrationNo: string | null;
    damRegistrationNo: string | null;
    diseaseCode: string | null;
  }> = {},
) {
  return {
    legacyId: overrides.legacyId ?? 1,
    registrationNo:
      overrides.registrationNo !== undefined
        ? overrides.registrationNo
        : "FI00001/21",
    sireRegistrationNo:
      overrides.sireRegistrationNo !== undefined
        ? overrides.sireRegistrationNo
        : "SF14404/90",
    damRegistrationNo:
      overrides.damRegistrationNo !== undefined
        ? overrides.damRegistrationNo
        : "SF19531/89",
    litterRaw: null,
    diseaseCode:
      overrides.diseaseCode !== undefined ? overrides.diseaseCode : "epi",
    description: null,
    publicRaw: "1",
    source: "legacy",
    modifiedRaw: null,
  };
}

function makeSairausRows() {
  return [
    { legacyId: 101, code: "epi", text: "Epilepsia" },
    { legacyId: 102, code: "pur", text: "Purenta" },
  ];
}

describe("runLegacyPhase1_25", () => {
  beforeEach(() => {
    createImportRunMock.mockReset();
    markImportRunRunningMock.mockReset();
    markImportRunFinishedMock.mockReset();
    createImportRunIssueMock.mockReset();
    createImportRunIssuesBulkMock.mockReset();
    fetchLegacyPhase1_25RowsMock.mockReset();
    dogRegistrationFindManyMock.mockReset();
    sairausCreateManyMock.mockReset();
    sairausFindManyMock.mockReset();
    koiranSairausCreateManyMock.mockReset();
    prismaMock.dog.update.mockReset();

    createImportRunMock.mockResolvedValue({ id: "run-1" });
    markImportRunRunningMock.mockResolvedValue(undefined);
    markImportRunFinishedMock.mockImplementation(async (_id, input) => ({
      id: "run-1",
      kind: "LEGACY_PHASE1_25",
      status: input.status,
      dogsUpserted: input.dogsUpserted,
      ownersUpserted: input.ownersUpserted,
      ownershipsUpserted: input.ownershipsUpserted,
      trialResultsUpserted: input.trialResultsUpserted,
      showResultsUpserted: input.showResultsUpserted,
      errorsCount: input.errorsCount,
      errorSummary: input.errorSummary,
      startedAt: new Date("2026-05-26T00:00:00.000Z"),
      finishedAt: new Date("2026-05-26T00:00:01.000Z"),
      createdByUserId: null,
      createdAt: new Date("2026-05-26T00:00:00.000Z"),
      updatedAt: new Date("2026-05-26T00:00:01.000Z"),
      issuesCount: 0,
    }));

    fetchLegacyPhase1_25RowsMock.mockResolvedValue({
      inbreeding: [],
      sairaudet: makeSairausRows(),
      koiranSairaudet: [],
    });
    dogRegistrationFindManyMock.mockResolvedValue([
      { registrationNo: "SF14404/90", dogId: "dog-sire" },
      { registrationNo: "SF19531/89", dogId: "dog-dam" },
      { registrationNo: "FI00001/21", dogId: "dog-real" },
    ]);
    sairausCreateManyMock.mockResolvedValue({ count: 2 });
    sairausFindManyMock.mockResolvedValue([
      { id: "sairaus-epi", koodi: "epi" },
      { id: "sairaus-pur", koodi: "pur" },
    ]);
    koiranSairausCreateManyMock.mockResolvedValue({ count: 0 });
  });

  it("imports synthetic REKNO rows with null dogId, resolved parents, and a warning issue", async () => {
    fetchLegacyPhase1_25RowsMock.mockResolvedValue({
      inbreeding: [],
      sairaudet: makeSairausRows(),
      koiranSairaudet: [
        makeLegacyRow({
          legacyId: 94,
          registrationNo: " epi_1/94 ",
          diseaseCode: "epi",
        }),
      ],
    });
    koiranSairausCreateManyMock.mockResolvedValue({ count: 1 });

    const result = await runLegacyPhase1_25("user-1");

    expect(result.status).toBe(202);
    expect(koiranSairausCreateManyMock).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          vanhaId: 94,
          dogId: null,
          evidenceKind: "LITTER",
          isaRekisterinumero: "SF14404/90",
          emaRekisterinumero: "SF19531/89",
          rekisterinumero: "EPI_1/94",
          sairausId: "sairaus-epi",
          sairausKoodi: "epi",
        }),
      ],
      skipDuplicates: true,
    });
    expect(createImportRunIssuesBulkMock).toHaveBeenCalledWith(
      "run-1",
      expect.arrayContaining([
        expect.objectContaining({
          stage: "koiran-sairaudet",
          severity: "WARNING",
          code: "KOIRAN_SAIRAUS_REGISTRATION_SYNTHETIC_IMPORTED",
          registrationNo: "EPI_1/94",
          sourceRowId: 94,
          sourceTable: "beasairaat",
        }),
      ]),
      expect.any(Object),
    );
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({
        status: "SUCCEEDED",
        errorsCount: 0,
        errorSummary: expect.stringContaining("fallbackImported=1"),
      }),
      expect.any(Object),
    );
  });

  it("imports resolved dog rows without duplicating source parent relations", async () => {
    fetchLegacyPhase1_25RowsMock.mockResolvedValue({
      inbreeding: [],
      sairaudet: makeSairausRows(),
      koiranSairaudet: [
        makeLegacyRow({
          legacyId: 10,
          registrationNo: "FI00001/21",
          sireRegistrationNo: "BAD-SIRE",
          damRegistrationNo: "BAD-DAM",
          diseaseCode: "epi",
        }),
      ],
    });
    koiranSairausCreateManyMock.mockResolvedValue({ count: 1 });

    const result = await runLegacyPhase1_25("user-1");

    expect(result.status).toBe(202);
    expect(koiranSairausCreateManyMock).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          vanhaId: 10,
          dogId: "dog-real",
          evidenceKind: "DOG",
          isaRekisterinumero: "BAD-SIRE",
          emaRekisterinumero: "BAD-DAM",
          rekisterinumero: "FI00001/21",
          sairausId: "sairaus-epi",
          sairausKoodi: "epi",
        }),
      ],
      skipDuplicates: true,
    });
    expect(createImportRunIssuesBulkMock).not.toHaveBeenCalled();
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({
        status: "SUCCEEDED",
        errorsCount: 0,
      }),
      expect.any(Object),
    );
  });

  it("skips valid unresolved REKNO rows after recording an import issue", async () => {
    fetchLegacyPhase1_25RowsMock.mockResolvedValue({
      inbreeding: [],
      sairaudet: makeSairausRows(),
      koiranSairaudet: [
        makeLegacyRow({
          legacyId: 11,
          registrationNo: "FI99999/21",
          diseaseCode: "epi",
        }),
      ],
    });

    const result = await runLegacyPhase1_25("user-1");

    expect(result.status).toBe(202);
    expect(koiranSairausCreateManyMock).not.toHaveBeenCalled();
    expect(createImportRunIssuesBulkMock).toHaveBeenCalledWith(
      "run-1",
      expect.arrayContaining([
        expect.objectContaining({
          stage: "koiran-sairaudet",
          severity: "WARNING",
          code: "KOIRAN_SAIRAUS_REGISTRATION_UNRESOLVED",
          registrationNo: "FI99999/21",
          sourceRowId: 11,
          sourceTable: "beasairaat",
        }),
      ]),
      expect.any(Object),
    );
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({
        status: "SUCCEEDED",
        errorsCount: 0,
        errorSummary: expect.stringContaining("unresolvedDogImported=1"),
      }),
      expect.any(Object),
    );
  });

  it("imports missing REKNO rows with a generated legacy identity and a warning issue", async () => {
    fetchLegacyPhase1_25RowsMock.mockResolvedValue({
      inbreeding: [],
      sairaudet: makeSairausRows(),
      koiranSairaudet: [
        makeLegacyRow({
          legacyId: 1,
          registrationNo: null,
          diseaseCode: "pur",
        }),
      ],
    });
    koiranSairausCreateManyMock.mockResolvedValue({ count: 1 });

    const result = await runLegacyPhase1_25();

    expect(result.status).toBe(202);
    expect(koiranSairausCreateManyMock).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          vanhaId: 1,
          dogId: null,
          evidenceKind: "LITTER",
          isaRekisterinumero: "SF14404/90",
          emaRekisterinumero: "SF19531/89",
          rekisterinumero: "LEGACY_BEASAIRAAT_1",
          sairausId: "sairaus-pur",
          sairausKoodi: "pur",
        }),
      ],
      skipDuplicates: true,
    });
    expect(createImportRunIssuesBulkMock).toHaveBeenCalledWith(
      "run-1",
      expect.arrayContaining([
        expect.objectContaining({
          stage: "koiran-sairaudet",
          severity: "WARNING",
          code: "KOIRAN_SAIRAUS_REGISTRATION_GENERATED_IMPORTED",
          registrationNo: "LEGACY_BEASAIRAAT_1",
          sourceRowId: 1,
          sourceTable: "beasairaat",
        }),
      ]),
      expect.any(Object),
    );
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({
        status: "SUCCEEDED",
        errorsCount: 0,
        errorSummary: expect.stringContaining("fallbackImported=1"),
      }),
      expect.any(Object),
    );
  });

  it("skips synthetic REKNO rows with incomplete parents after recording an import issue", async () => {
    dogRegistrationFindManyMock.mockResolvedValue([
      { registrationNo: "SF14404/90", dogId: "dog-sire" },
      { registrationNo: "FI00001/21", dogId: "dog-real" },
    ]);
    fetchLegacyPhase1_25RowsMock.mockResolvedValue({
      inbreeding: [],
      sairaudet: makeSairausRows(),
      koiranSairaudet: [
        makeLegacyRow({
          legacyId: 95,
          registrationNo: "EPI_2/94",
          diseaseCode: "epi",
        }),
      ],
    });

    const result = await runLegacyPhase1_25("user-1");

    expect(result.status).toBe(202);
    expect(koiranSairausCreateManyMock).not.toHaveBeenCalled();
    expect(createImportRunIssuesBulkMock).toHaveBeenCalledWith(
      "run-1",
      expect.arrayContaining([
        expect.objectContaining({
          code: "KOIRAN_SAIRAUS_DAM_UNRESOLVED",
          registrationNo: "EPI_2/94",
          sourceRowId: 95,
        }),
      ]),
      expect.any(Object),
    );
  });

  it("still skips rows missing disease code or unresolved disease definitions", async () => {
    fetchLegacyPhase1_25RowsMock.mockResolvedValue({
      inbreeding: [],
      sairaudet: makeSairausRows(),
      koiranSairaudet: [
        makeLegacyRow({
          legacyId: 2,
          registrationNo: "FI00001/21",
          diseaseCode: null,
        }),
        makeLegacyRow({
          legacyId: 3,
          registrationNo: "FI00001/21",
          diseaseCode: "unknown",
        }),
      ],
    });
    koiranSairausCreateManyMock.mockResolvedValue({ count: 0 });

    const result = await runLegacyPhase1_25("user-1");

    expect(result.status).toBe(202);
    expect(koiranSairausCreateManyMock).not.toHaveBeenCalled();
    expect(createImportRunIssuesBulkMock).toHaveBeenCalledWith(
      "run-1",
      expect.arrayContaining([
        expect.objectContaining({
          stage: "koiran-sairaudet",
          code: "KOIRAN_SAIRAUS_CODE_MISSING",
          registrationNo: "FI00001/21",
          sourceRowId: 2,
        }),
        expect.objectContaining({
          stage: "koiran-sairaudet",
          code: "KOIRAN_SAIRAUS_DEFINITION_NOT_FOUND",
          registrationNo: "FI00001/21",
          sourceRowId: 3,
        }),
      ]),
      expect.any(Object),
    );
    expect(markImportRunFinishedMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({
        status: "SUCCEEDED",
        errorsCount: 2,
        errorSummary: expect.stringContaining("errors=2"),
      }),
      expect.any(Object),
    );
  });
});
