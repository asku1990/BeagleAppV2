import { beforeEach, describe, expect, it, vi } from "vitest";
import { listAdminUsers } from "../list-users";

const { listAdminUsersDbMock } = vi.hoisted(() => ({
  listAdminUsersDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  listAdminUsersDb: listAdminUsersDbMock,
}));

describe("listAdminUsers", () => {
  beforeEach(() => {
    listAdminUsersDbMock.mockReset();
  });

  it("returns users from db in contract format", async () => {
    listAdminUsersDbMock.mockResolvedValue([
      {
        id: "u_1",
        email: "admin@example.com",
        name: "Admin",
        role: "ADMIN",
        banned: false,
        createdAt: new Date("2026-02-19T10:00:00.000Z"),
        lastSignInAt: new Date("2026-02-19T11:00:00.000Z"),
      },
      {
        id: "u_2",
        email: "user@example.com",
        name: null,
        role: "USER",
        banned: true,
        createdAt: new Date("2026-02-18T10:00:00.000Z"),
        lastSignInAt: null,
      },
    ]);

    await expect(listAdminUsers()).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          items: [
            {
              id: "u_1",
              email: "admin@example.com",
              name: "Admin",
              role: "ADMIN",
              status: "active",
              createdAt: "2026-02-19T10:00:00.000Z",
              lastSignInAt: "2026-02-19T11:00:00.000Z",
            },
            {
              id: "u_2",
              email: "user@example.com",
              name: null,
              role: "USER",
              status: "suspended",
              createdAt: "2026-02-18T10:00:00.000Z",
              lastSignInAt: null,
            },
          ],
        },
      },
    });
  });

  it("returns internal error when db query fails", async () => {
    listAdminUsersDbMock.mockRejectedValue(new Error("boom"));

    await expect(listAdminUsers()).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin users.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
