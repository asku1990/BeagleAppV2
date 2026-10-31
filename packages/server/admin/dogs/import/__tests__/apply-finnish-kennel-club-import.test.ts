import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyFinnishKennelClubDogImport } from "../apply-finnish-kennel-club-import";

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
const parsed = {
  rows: [row],
  sourceRowCount: 1,
  sheetName: "Rekisteri",
  facts: [],
};
const plan = { creates: [], updates: [], references: [], historicalLinks: [] };

function evaluation(overrides: Record<string, unknown> = {}) {
  return {
    previewDigest: "digest",
    applyAllowed: true,
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
    loadStateMock.mockResolvedValue({
      dogs: [],
      colors: [],
      historicalLinksByRegistration: {},
    });
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

  it("blocks writes when evaluation has blockers", async () => {
    evaluateMock.mockReturnValue(
      evaluation({ applyAllowed: false, blockedCount: 1 }),
    );
    const result = await apply();
    expect(result.body).toMatchObject({ code: "IMPORT_BLOCKED" });
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
    expect(writeMock).toHaveBeenCalledWith(plan, {
      ...audit,
      source: "WEB",
      intent: "IMPORT_FINNISH_DOG_REGISTRATIONS",
    });
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
