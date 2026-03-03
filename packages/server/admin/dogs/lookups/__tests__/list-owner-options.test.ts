import { beforeEach, describe, expect, it, vi } from "vitest";
import { listAdminOwnerOptions } from "../list-owner-options";

const { listAdminOwnerOptionsDbMock } = vi.hoisted(() => ({
  listAdminOwnerOptionsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  listAdminOwnerOptionsDb: listAdminOwnerOptionsDbMock,
}));

describe("listAdminOwnerOptions", () => {
  beforeEach(() => {
    listAdminOwnerOptionsDbMock.mockReset();
  });

  it("returns unauthorized response without user", async () => {
    await expect(listAdminOwnerOptions({}, null)).resolves.toEqual({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });
  });

  it("returns forbidden response for non-admin user", async () => {
    await expect(
      listAdminOwnerOptions(
        {},
        {
          id: "u_1",
          email: "user@example.com",
          username: null,
          role: "USER",
        },
      ),
    ).resolves.toEqual({
      status: 403,
      body: {
        ok: false,
        error: "Admin role required.",
        code: "FORBIDDEN",
      },
    });
  });

  it("returns mapped owner options on success", async () => {
    listAdminOwnerOptionsDbMock.mockResolvedValue({
      items: [
        { id: "ow_1", name: "Aalto Esa" },
        { id: "ow_2", name: "Virtanen Tiina" },
      ],
    });

    await expect(
      listAdminOwnerOptions(
        { query: " esa ", limit: 150 },
        {
          id: "u_1",
          email: "admin@example.com",
          username: "Admin",
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          items: [
            { id: "ow_1", name: "Aalto Esa" },
            { id: "ow_2", name: "Virtanen Tiina" },
          ],
        },
      },
    });

    expect(listAdminOwnerOptionsDbMock).toHaveBeenCalledWith({
      query: "esa",
      limit: 100,
    });
  });

  it("returns internal error when db throws", async () => {
    listAdminOwnerOptionsDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      listAdminOwnerOptions(
        {},
        {
          id: "u_1",
          email: "admin@example.com",
          username: "Admin",
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load owner options.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
