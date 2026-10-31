import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DOG_IMPORT_MAX_FILE_BYTES,
  previewFinnishKennelClubDogImport,
} from "../preview-finnish-kennel-club-import";

const { parseMock, loadStateMock, evaluateMock } = vi.hoisted(() => ({
  parseMock: vi.fn(),
  loadStateMock: vi.fn(),
  evaluateMock: vi.fn(),
}));

vi.mock(
  "../internal/sources/finnish-kennel-club/parse-finnish-kennel-club-workbook",
  () => ({
    parseFinnishKennelClubWorkbook: parseMock,
  }),
);
vi.mock("../internal/runtime/evaluate-dog-import-rows", () => ({
  evaluateDogImportRows: evaluateMock,
}));
vi.mock("@beagle/db", () => ({ loadDogImportStateDb: loadStateMock }));

const admin = {
  id: "admin-1",
  email: "admin@example.com",
  username: "admin",
  role: "ADMIN" as const,
};
const row = {
  source: "FINNISH_KENNEL_CLUB",
  sourceRowNumber: 2,
  registrationNo: "FI12345/24",
  name: "DOG",
  sex: "MALE",
  birthDate: null,
  registeredOn: null,
  breederNameText: null,
  originTypeText: null,
  originCountryText: null,
  colorName: null,
  tailText: null,
  sireRegistrationNo: null,
  damRegistrationNo: null,
};

describe("previewFinnishKennelClubDogImport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    parseMock.mockReturnValue({
      sheetName: "Rekisteri",
      rows: [row],
      sourceRowCount: 1,
      facts: [],
    });
    loadStateMock.mockResolvedValue({
      dogs: [],
      colors: [],
      historicalLinksByRegistration: {},
    });
    evaluateMock.mockReturnValue({
      previewDigest: "digest",
      applyAllowed: true,
      createCount: 1,
      updateCount: 0,
      unchangedCount: 0,
      blockedCount: 0,
      referenceCount: 0,
      issues: [],
      rows: [],
    });
  });

  it("requires an administrator", async () => {
    const result = await previewFinnishKennelClubDogImport(
      { bytes: Buffer.from("file"), fileName: "dogs.xlsx" },
      null,
    );
    expect(result.status).toBe(401);
    expect(parseMock).not.toHaveBeenCalled();
  });

  it("returns a preview without writing and forwards registrations to state loading", async () => {
    const bytes = Buffer.from("file");
    const result = await previewFinnishKennelClubDogImport(
      { bytes, fileName: "dogs.xlsx" },
      admin,
    );
    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      ok: true,
      data: {
        fileName: "dogs.xlsx",
        sheetName: "Rekisteri",
        previewDigest: "digest",
      },
    });
    expect(loadStateMock).toHaveBeenCalledWith(["FI12345/24"]);
    expect(evaluateMock).toHaveBeenCalledWith([row], expect.anything(), []);
  });

  it("rejects empty and oversized sources", async () => {
    expect(
      (
        await previewFinnishKennelClubDogImport(
          { bytes: Buffer.alloc(0), fileName: "x" },
          admin,
        )
      ).body,
    ).toMatchObject({ code: "SOURCE_RESOURCE_LIMIT_EXCEEDED" });
    expect(
      (
        await previewFinnishKennelClubDogImport(
          { bytes: Buffer.alloc(DOG_IMPORT_MAX_FILE_BYTES + 1), fileName: "x" },
          admin,
        )
      ).status,
    ).toBe(413);
    expect(parseMock).not.toHaveBeenCalled();
  });

  it("rejects workbooks with too many rows or parser errors", async () => {
    parseMock.mockReturnValueOnce({
      rows: Array(10_001).fill(row),
      sourceRowCount: 10_001,
      sheetName: "x",
      facts: [],
    });
    expect(
      (
        await previewFinnishKennelClubDogImport(
          { bytes: Buffer.from("x"), fileName: "x" },
          admin,
        )
      ).body,
    ).toMatchObject({ code: "SOURCE_RESOURCE_LIMIT_EXCEEDED" });
    parseMock.mockImplementationOnce(() => {
      throw new Error("bad workbook");
    });
    expect(
      (
        await previewFinnishKennelClubDogImport(
          { bytes: Buffer.from("x"), fileName: "x" },
          admin,
        )
      ).body,
    ).toMatchObject({ code: "SOURCE_FILE_UNREADABLE" });
  });
});
