import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchVirtualPairingDogs } from "../search";

const { searchVirtualPairingDogsDbMock } = vi.hoisted(() => ({
  searchVirtualPairingDogsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  searchVirtualPairingDogsDb: searchVirtualPairingDogsDbMock,
}));

describe("searchVirtualPairingDogs", () => {
  beforeEach(() => {
    searchVirtualPairingDogsDbMock.mockReset();
  });

  it("normalizes paging and returns the db response", async () => {
    searchVirtualPairingDogsDbMock.mockResolvedValue({
      field: "name",
      query: "%kide%",
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
    });

    await expect(
      searchVirtualPairingDogs({
        field: "name",
        query: "%kide%",
        page: 99,
        pageSize: 500,
      }),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          field: "name",
          query: "%kide%",
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

    expect(searchVirtualPairingDogsDbMock).toHaveBeenCalledWith({
      field: "name",
      query: "%kide%",
      page: 99,
      pageSize: 50,
    });
  });
});
