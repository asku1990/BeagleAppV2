import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchAdminVirtualPairingAction } from "../search-admin-virtual-pairing";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  searchAdminVirtualPairingMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  searchAdminVirtualPairingMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  searchAdminVirtualPairing: searchAdminVirtualPairingMock,
}));

describe("searchAdminVirtualPairingAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    searchAdminVirtualPairingMock.mockReset();
  });

  it("returns mapped search data when search succeeds", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    });
    searchAdminVirtualPairingMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          field: "name",
          query: "Kide",
          total: 1,
          totalPages: 1,
          page: 1,
          items: [
            {
              id: "dog_1",
              ekNo: 5588,
              registrationNo: "FI12345/21",
              name: "Metsapolun Kide",
              sex: "N",
            },
          ],
        },
      },
    });

    await expect(
      searchAdminVirtualPairingAction({
        field: "name",
        query: "Kide",
        page: 1,
        pageSize: 10,
      }),
    ).resolves.toEqual({
      data: {
        field: "name",
        query: "Kide",
        total: 1,
        totalPages: 1,
        page: 1,
        items: [
          {
            id: "dog_1",
            ekNo: 5588,
            registrationNo: "FI12345/21",
            name: "Metsapolun Kide",
            sex: "N",
          },
        ],
      },
      hasError: false,
    });
  });

  it("returns forbidden when admin access is missing", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(
      searchAdminVirtualPairingAction({ field: "name", query: "Kide" }),
    ).resolves.toMatchObject({
      data: null,
      hasError: true,
      errorCode: "FORBIDDEN",
      message: "Admin access required.",
    });
  });
});
