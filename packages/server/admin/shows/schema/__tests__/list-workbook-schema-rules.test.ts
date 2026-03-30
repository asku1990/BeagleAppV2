import { beforeEach, describe, expect, it, vi } from "vitest";
import { listAdminShowWorkbookSchemaRules } from "../list-workbook-schema-rules";

const { listAdminShowWorkbookSchemaRulesDbMock } = vi.hoisted(() => ({
  listAdminShowWorkbookSchemaRulesDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  listAdminShowWorkbookSchemaRulesDb: listAdminShowWorkbookSchemaRulesDbMock,
}));

describe("listAdminShowWorkbookSchemaRules", () => {
  beforeEach(() => {
    listAdminShowWorkbookSchemaRulesDbMock.mockReset();
  });

  it("returns the active workbook schema rules payload", async () => {
    const rules = [
      {
        code: "EVENT_DATE",
        headerName: "Aika",
        policy: "IMPORT",
      },
    ];

    listAdminShowWorkbookSchemaRulesDbMock.mockResolvedValue(rules);

    await expect(listAdminShowWorkbookSchemaRules()).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: { rules },
      },
    });
  });
});
