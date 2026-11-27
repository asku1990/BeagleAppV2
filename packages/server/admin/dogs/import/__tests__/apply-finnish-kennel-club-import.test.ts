import { createHash } from "node:crypto";
import type { DogImportStateDb, DogImportWritePlanDb } from "@beagle/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyFinnishKennelClubDogImport } from "../apply-finnish-kennel-club-import";
import { WorkbookArchiveLimitError } from "../internal/sources/finnish-kennel-club/read-bounded-workbook-archive";

const { parseMock, loadStateMock, evaluateMock, writeMock } = vi.hoisted(
  () => ({
    parseMock: vi.fn(),
    loadStateMock: vi.fn(),
    evaluateMock: vi.fn(),
    writeMock: vi.fn(),
  }),
);

vi.mock(
  "../internal/sources/finnish-kennel-club/parse-finnish-kennel-club-workbook",
  () => ({ parseFinnishKennelClubWorkbook: parseMock }),
);
vi.mock("../internal/runtime/evaluate-dog-import-rows", () => ({
  evaluateDogImportRows: evaluateMock,
}));
vi.mock("@beagle/db", () => ({
  loadDogImportStateDb: loadStateMock,
  applyDogImportPlanDb: writeMock,
}));

const admin = {
  id: "admin-1",
  email: "admin@example.com",
  username: "admin",
  role: "ADMIN" as const,
};
const bytes = Buffer.from("file");
const hash = createHash("sha256").update(bytes).digest("hex");
const audit = { actorUserId: "admin-1", requestId: "request-1" };
const row = {
  registrationNo: "FI12345/24",
  sireRegistrationNo: null,
  damRegistrationNo: null,
};
const state: DogImportStateDb = {
  dogs: [],
  colors: [],
  historicalLinksByRegistration: {},
  breedersByKennel: new Map(),
};
const parsed = {
  rows: [row],
  sourceRowCount: 1,
  sheetName: "Rekisteri",
  facts: [],
};
const emptyPlan = {
  breederMatches: [],
  creates: [],
  updates: [],
  references: [],
  historicalLinks: [],
};
const plan = {
  ...emptyPlan,
  historicalLinks: [
    {
      registrationNo: row.registrationNo,
      showEntryIds: ["show-1"],
      trialEntryIds: [],
    },
  ],
};

function evaluation(overrides: Record<string, unknown> = {}) {
  return {
    previewDigest: "digest",
    hasBlockers: false,
    hasChanges: true,
    createCount: 0,
    updateCount: 0,
    unchangedCount: 0,
    blockedCount: 0,
    referenceCount: 0,
    issues: [],
    rows: [],
    plan,
    ...overrides,
  };
}

describe("applyFinnishKennelClubDogImport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    parseMock.mockReturnValue(parsed);
    loadStateMock.mockResolvedValue(state);
    evaluateMock.mockReturnValue(evaluation());
    writeMock.mockResolvedValue({
      createdCount: 0,
      updatedCount: 0,
      referenceCount: 0,
    });
  });

  const apply = (
    overrides: Partial<{
      sourceFileSha256: string;
      previewDigest: string;
    }> = {},
  ) =>
    applyFinnishKennelClubDogImport(
      {
        bytes,
        sourceFileSha256: hash,
        previewDigest: "digest",
        audit,
        ...overrides,
      },
      admin,
    );

  it("requires an administrator", async () => {
    const result = await applyFinnishKennelClubDogImport(
      { bytes, sourceFileSha256: hash, previewDigest: "digest", audit },
      null,
    );
    expect(result.status).toBe(401);
    expect(writeMock).not.toHaveBeenCalled();
  });

  it("rejects changed source bytes", async () => {
    const result = await apply({ sourceFileSha256: "wrong" });
    expect(result.body).toMatchObject({ code: "SOURCE_FILE_CHANGED" });
    expect(parseMock).not.toHaveBeenCalled();
  });

  it("rejects a stale preview digest", async () => {
    const result = await apply({ previewDigest: "old" });
    expect(result.body).toMatchObject({ code: "PREVIEW_STALE" });
    expect(writeMock).not.toHaveBeenCalled();
  });

  it("returns 413 for archive expansion limits before loading or writing state", async () => {
    parseMock.mockRejectedValueOnce(new WorkbookArchiveLimitError());

    expect(await apply()).toMatchObject({
      status: 413,
      body: { code: "SOURCE_RESOURCE_LIMIT_EXCEEDED" },
    });
    expect(loadStateMock).not.toHaveBeenCalled();
    expect(writeMock).not.toHaveBeenCalled();
  });

  it("blocks writes when evaluation has blockers", async () => {
    evaluateMock.mockReturnValue(
      evaluation({ hasBlockers: true, blockedCount: 1 }),
    );
    const result = await apply();
    expect(result.body).toMatchObject({ code: "IMPORT_BLOCKED" });
    expect(writeMock).not.toHaveBeenCalled();
  });

  it("returns an unchanged result without starting a write for an empty plan", async () => {
    evaluateMock.mockReturnValue(
      evaluation({ hasChanges: false, unchangedCount: 1, plan: emptyPlan }),
    );
    const result = await apply();
    expect(result).toMatchObject({
      status: 200,
      body: {
        ok: true,
        data: {
          success: true,
          createdCount: 0,
          updatedCount: 0,
          unchangedCount: 1,
          referenceCount: 0,
        },
      },
    });
    expect(writeMock).not.toHaveBeenCalled();
  });

  it("forwards the plan and audited web import context on success", async () => {
    writeMock.mockResolvedValue({
      createdCount: 2,
      updatedCount: 3,
      referenceCount: 1,
    });
    const result = await apply();
    expect(result.body).toMatchObject({
      ok: true,
      data: {
        success: true,
        createdCount: 2,
        updatedCount: 3,
        referenceCount: 1,
      },
    });
    expect(writeMock).toHaveBeenCalledWith(
      [row.registrationNo],
      [undefined],
      { ...audit, source: "WEB", intent: "IMPORT_FINNISH_DOG_REGISTRATIONS" },
      expect.any(Function),
    );
  });

  it("revalidates the reviewed plan on a serializable retry before writing", async () => {
    evaluateMock
      .mockReturnValueOnce(evaluation())
      .mockReturnValueOnce(evaluation())
      .mockReturnValueOnce(evaluation({ previewDigest: "changed" }));
    const firstSnapshot = { ...state };
    const retrySnapshot = { ...state };
    const write = vi.fn();
    type Verify = (snapshot: DogImportStateDb) => DogImportWritePlanDb;
    writeMock
      .mockImplementationOnce(
        async (_registrations, _kennels, _audit, verify: Verify) => {
          expect(verify(firstSnapshot)).toEqual(plan);
          throw Object.assign(new Error("Serialization conflict"), {
            code: "P2034",
          });
        },
      )
      .mockImplementationOnce(
        async (_registrations, _kennels, _audit, verify: Verify) => {
          const verified = verify(retrySnapshot);
          return write(verified);
        },
      );

    expect(await apply()).toMatchObject({
      status: 409,
      body: { code: "PREVIEW_STALE" },
    });
    expect(evaluateMock).toHaveBeenNthCalledWith(
      2,
      parsed.rows,
      firstSnapshot,
      [],
    );
    expect(evaluateMock).toHaveBeenNthCalledWith(
      3,
      parsed.rows,
      retrySnapshot,
      [],
    );
    expect(write).not.toHaveBeenCalled();
  });

  it("returns the expected stale error from a write", async () => {
    writeMock.mockRejectedValue(new Error("DOG_IMPORT_STALE"));
    const result = await apply();
    expect(result).toMatchObject({
      status: 409,
      body: { ok: false, code: "PREVIEW_STALE" },
    });
  });

  it("returns an unexpected write error", async () => {
    writeMock.mockRejectedValue(new Error("database unavailable"));
    const result = await apply();
    expect(result).toMatchObject({
      status: 500,
      body: { ok: false, code: "IMPORT_WRITE_FAILED" },
    });
  });
});
