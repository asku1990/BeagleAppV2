import { beforeEach, describe, expect, it, vi } from "vitest";
import { previewAdminShowWorkbookImportAction } from "../preview-workbook-import";

const { requireAdminLayoutAccessMock, previewAdminShowWorkbookImportMock } =
  vi.hoisted(() => ({
    requireAdminLayoutAccessMock: vi.fn(),
    previewAdminShowWorkbookImportMock: vi.fn(),
  }));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@beagle/server", () => ({
  previewAdminShowWorkbookImport: previewAdminShowWorkbookImportMock,
}));

describe("previewAdminShowWorkbookImportAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    previewAdminShowWorkbookImportMock.mockReset();
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

    await expect(
      previewAdminShowWorkbookImportAction(formData),
    ).resolves.toEqual({
      ok: false,
      error: {
        code: "FORBIDDEN",
        message: "Admin access required.",
      },
    });
  });

  it("returns preview data when the workbook parses successfully", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    previewAdminShowWorkbookImportMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          fileName: "Näyttelyt.xlsx",
          sheetName: "Näyttelyt 2024",
          rowCount: 2,
          acceptedRowCount: 2,
          rejectedRowCount: 0,
          eventCount: 1,
          entryCount: 2,
          resultItemCount: 7,
          infoCount: 0,
          warningCount: 1,
          errorCount: 0,
          schema: {
            coverage: {
              totalWorkbookColumns: 0,
              importedColumnCount: 0,
              ignoredColumnCount: 0,
              blockedColumnCount: 0,
            },
            structuralColumns: [],
            missingStructuralFields: [],
            definitionColumns: [],
            ignoredColumns: [],
            blockedColumns: [],
          },
          events: [],
          issues: [],
        },
      },
    });

    const workbookFile = new File([Buffer.from("xlsx")], "Näyttelyt.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const formData = new FormData();
    formData.append("workbook", workbookFile);

    await expect(
      previewAdminShowWorkbookImportAction(formData),
    ).resolves.toEqual({
      ok: true,
      data: {
        fileName: "Näyttelyt.xlsx",
        sheetName: "Näyttelyt 2024",
        rowCount: 2,
        acceptedRowCount: 2,
        rejectedRowCount: 0,
        eventCount: 1,
        entryCount: 2,
        resultItemCount: 7,
        infoCount: 0,
        warningCount: 1,
        errorCount: 0,
        schema: {
          coverage: {
            totalWorkbookColumns: 0,
            importedColumnCount: 0,
            ignoredColumnCount: 0,
            blockedColumnCount: 0,
          },
          structuralColumns: [],
          missingStructuralFields: [],
          definitionColumns: [],
          ignoredColumns: [],
          blockedColumns: [],
        },
        events: [],
        issues: [],
      },
    });

    expect(previewAdminShowWorkbookImportMock).toHaveBeenCalledWith({
      fileName: "Näyttelyt.xlsx",
      workbook: expect.any(Buffer),
    });
  });
});
