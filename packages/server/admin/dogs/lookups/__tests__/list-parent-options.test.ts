import { beforeEach, describe, expect, it, vi } from "vitest";
import { listAdminDogParentOptions } from "../list-parent-options";

const { listAdminDogParentOptionsDbMock } = vi.hoisted(() => ({
  listAdminDogParentOptionsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  listAdminDogParentOptionsDb: listAdminDogParentOptionsDbMock,
}));

describe("listAdminDogParentOptions", () => {
  beforeEach(() => {
    listAdminDogParentOptionsDbMock.mockReset();
  });

  it("returns unauthenticated when user is missing", async () => {
    await expect(listAdminDogParentOptions({}, null)).resolves.toEqual({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });
  });

  it("returns forbidden when user is not admin", async () => {
    await expect(
      listAdminDogParentOptions(
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

  it("returns mapped parent options on success", async () => {
    listAdminDogParentOptionsDbMock.mockResolvedValue({
      items: [
        {
          id: "dog_1",
          name: "Korven Aatos",
          sex: "MALE",
          registrationNo: "FI54321/20",
        },
      ],
    });

    await expect(
      listAdminDogParentOptions(
        { query: "korven", limit: 50 },
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
            {
              id: "dog_1",
              name: "Korven Aatos",
              sex: "MALE",
              registrationNo: "FI54321/20",
            },
          ],
        },
      },
    });

    expect(listAdminDogParentOptionsDbMock).toHaveBeenCalledWith({
      query: "korven",
      limit: 50,
    });
  });

  it("returns internal error when db fails", async () => {
    listAdminDogParentOptionsDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      listAdminDogParentOptions(
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
        error: "Failed to load parent options.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
