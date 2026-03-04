import { beforeEach, describe, expect, it, vi } from "vitest";
import { listAdminBreederOptions } from "../list-breeder-options";

const { listAdminBreederOptionsDbMock } = vi.hoisted(() => ({
  listAdminBreederOptionsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  listAdminBreederOptionsDb: listAdminBreederOptionsDbMock,
}));

describe("listAdminBreederOptions", () => {
  beforeEach(() => {
    listAdminBreederOptionsDbMock.mockReset();
  });

  it("returns unauthenticated when current user is missing", async () => {
    await expect(listAdminBreederOptions({}, null)).resolves.toEqual({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });
  });

  it("returns forbidden when current user is not admin", async () => {
    await expect(
      listAdminBreederOptions(
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

  it("returns mapped breeder options on success", async () => {
    listAdminBreederOptionsDbMock.mockResolvedValue({
      items: [
        { id: "br_1", name: "Metsapolun" },
        { id: "br_2", name: "Korven" },
      ],
    });

    await expect(
      listAdminBreederOptions(
        { query: " metsa ", limit: 999 },
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
            { id: "br_1", name: "Metsapolun" },
            { id: "br_2", name: "Korven" },
          ],
        },
      },
    });

    expect(listAdminBreederOptionsDbMock).toHaveBeenCalledWith({
      query: "metsa",
      limit: 100,
    });
  });

  it("returns internal error when db fails", async () => {
    listAdminBreederOptionsDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      listAdminBreederOptions(
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
        error: "Failed to load breeder options.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
