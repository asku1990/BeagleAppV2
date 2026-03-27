import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyAdminShowWorkbookImportAction } from "../apply-workbook-import";

const { requireAdminLayoutAccessMock, applyAdminShowWorkbookImportMock } =
  vi.hoisted(() => ({
    requireAdminLayoutAccessMock: vi.fn(),
    applyAdminShowWorkbookImportMock: vi.fn(),
  }));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@beagle/server", () => ({
  applyAdminShowWorkbookImport: applyAdminShowWorkbookImportMock,
}));

describe("applyAdminShowWorkbookImportAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    applyAdminShowWorkbookImportMock.mockReset();
  });

  it("returns forbidden when the user is not an admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({
      ok: false,
      status: 403,
    });
    const formData = new FormData();
    formData.append(
      "workbook",
      new File([Buffer.from("xlsx")], "Näyttelyt.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    );

    await expect(applyAdminShowWorkbookImportAction(formData)).resolves.toEqual(
      {
        ok: false,
        error: {
          code: "FORBIDDEN",
          message: "Admin access required.",
        },
      },
    );
  });

  it("returns apply counts when import succeeds", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    applyAdminShowWorkbookImportMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          success: true,
          eventsCreated: 1,
          entriesCreated: 2,
          itemsCreated: 5,
          infoCount: 0,
          warningCount: 0,
          errorCount: 0,
          issues: [],
        },
      },
    });
    const formData = new FormData();
    formData.append(
      "workbook",
      new File([Buffer.from("xlsx")], "Näyttelyt.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    );

    await expect(applyAdminShowWorkbookImportAction(formData)).resolves.toEqual(
      {
        ok: true,
        data: {
          success: true,
          eventsCreated: 1,
          entriesCreated: 2,
          itemsCreated: 5,
          infoCount: 0,
          warningCount: 0,
          errorCount: 0,
          issues: [],
        },
      },
    );
  });
});
