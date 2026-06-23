import { beforeEach, describe, expect, it, vi } from "vitest";
import { listAdminDogColorOptions } from "../list-color-options";

const { listAdminDogColorOptionsDbMock } = vi.hoisted(() => ({
  listAdminDogColorOptionsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  listAdminDogColorOptionsDb: listAdminDogColorOptionsDbMock,
}));

describe("listAdminDogColorOptions", () => {
  beforeEach(() => {
    listAdminDogColorOptionsDbMock.mockReset();
  });

  it("returns unauthenticated when current user is missing", async () => {
    await expect(listAdminDogColorOptions(null)).resolves.toEqual({
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
      listAdminDogColorOptions({
        id: "u_1",
        email: "user@example.com",
        username: null,
        role: "USER",
      }),
    ).resolves.toEqual({
      status: 403,
      body: {
        ok: false,
        error: "Admin role required.",
        code: "FORBIDDEN",
      },
    });
  });

  it("returns color options on success", async () => {
    listAdminDogColorOptionsDbMock.mockResolvedValue({
      items: [
        {
          code: 1,
          nameFi: "Musta",
          nameSv: "Svart",
          nameEn: "Black",
          status: "SELECTABLE",
        },
        {
          code: 2,
          nameFi: "Valkoinen",
          nameSv: null,
          nameEn: "White",
          status: "HIDDEN",
        },
      ],
    });

    await expect(
      listAdminDogColorOptions(
        {
          id: "u_1",
          email: "admin@example.com",
          username: "Admin",
          role: "ADMIN",
        },
        {
          requestId: "req-1",
          actorUserId: "u_1",
        },
      ),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          items: [
            {
              code: 1,
              nameFi: "Musta",
              nameSv: "Svart",
              nameEn: "Black",
              status: "SELECTABLE",
            },
            {
              code: 2,
              nameFi: "Valkoinen",
              nameSv: null,
              nameEn: "White",
              status: "HIDDEN",
            },
          ],
        },
      },
    });

    expect(listAdminDogColorOptionsDbMock).toHaveBeenCalledWith();
  });

  it("returns internal error when db fails", async () => {
    listAdminDogColorOptionsDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      listAdminDogColorOptions({
        id: "u_1",
        email: "admin@example.com",
        username: "Admin",
        role: "ADMIN",
      }),
    ).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load dog color options.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
