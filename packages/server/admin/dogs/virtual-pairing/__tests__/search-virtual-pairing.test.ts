import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchAdminVirtualPairing } from "../search-virtual-pairing";

const { searchVirtualPairingDogsMock } = vi.hoisted(() => ({
  searchVirtualPairingDogsMock: vi.fn(),
}));

vi.mock("@server/dogs/virtual-pairing", () => ({
  searchVirtualPairingDogs: searchVirtualPairingDogsMock,
}));

const adminUser = {
  id: "admin_1",
  email: "admin@example.com",
  username: "admin",
  role: "ADMIN" as const,
};

describe("searchAdminVirtualPairing", () => {
  beforeEach(() => {
    searchVirtualPairingDogsMock.mockReset();
  });

  it("requires admin access before searching", async () => {
    await expect(
      searchAdminVirtualPairing({ field: "name", query: "Kide" }, null),
    ).resolves.toMatchObject({
      status: 401,
      body: {
        ok: false,
        code: "UNAUTHENTICATED",
      },
    });
    expect(searchVirtualPairingDogsMock).not.toHaveBeenCalled();
  });

  it("returns the shared search response for admins", async () => {
    searchVirtualPairingDogsMock.mockResolvedValue({
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
      searchAdminVirtualPairing(
        {
          field: "name",
          query: "Kide",
          page: 2,
          pageSize: 5,
        },
        adminUser,
      ),
    ).resolves.toMatchObject({
      status: 200,
      body: {
        ok: true,
        data: {
          total: 1,
          items: [
            {
              id: "dog_1",
              registrationNo: "FI12345/21",
            },
          ],
        },
      },
    });
  });
});
