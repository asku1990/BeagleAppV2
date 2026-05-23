import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  searchVirtualPairingDogsDbMock: vi.fn(),
  loggerInfoMock: vi.fn(),
  loggerErrorMock: vi.fn(),
  withLogContextMock: vi.fn(),
}));

const searchVirtualPairingDogsDbMock = hoisted.searchVirtualPairingDogsDbMock;
const loggerInfoMock = hoisted.loggerInfoMock;
const loggerErrorMock = hoisted.loggerErrorMock;
const withLogContextMock = hoisted.withLogContextMock;

vi.mock("@beagle/db", () => ({
  searchVirtualPairingDogsDb: hoisted.searchVirtualPairingDogsDbMock,
}));

vi.mock("../../core/logger", () => ({
  toErrorLog: (error: Error) => ({
    error: {
      type: error.name,
      message: error.message,
    },
  }),
  withLogContext: hoisted.withLogContextMock.mockImplementation(() => ({
    info: hoisted.loggerInfoMock,
    error: hoisted.loggerErrorMock,
  })),
}));

const { searchVirtualPairingDogs } = await import("../search");

describe("searchVirtualPairingDogs", () => {
  beforeEach(() => {
    searchVirtualPairingDogsDbMock.mockReset();
    loggerInfoMock.mockReset();
    loggerErrorMock.mockReset();
    withLogContextMock.mockReset();
    withLogContextMock.mockImplementation(() => ({
      info: loggerInfoMock,
      error: loggerErrorMock,
    }));
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

  it("defaults blank paging values and forwards request context", async () => {
    searchVirtualPairingDogsDbMock.mockResolvedValue({
      field: "reg",
      query: "FI12345/21",
      total: 1,
      totalPages: 1,
      page: 1,
      items: [],
    });

    await expect(
      searchVirtualPairingDogs(
        {
          field: "reg",
          query: "FI12345/21",
        },
        {
          requestId: "req_1",
          actorUserId: "user_1",
        },
      ),
    ).resolves.toMatchObject({
      status: 200,
      body: {
        ok: true,
        data: {
          field: "reg",
          query: "FI12345/21",
          total: 1,
          totalPages: 1,
          page: 1,
          items: [],
        },
      },
    });

    expect(searchVirtualPairingDogsDbMock).toHaveBeenCalledWith({
      field: "reg",
      query: "FI12345/21",
      page: 1,
      pageSize: 10,
    });
  });

  it("returns an internal error when the db layer fails", async () => {
    searchVirtualPairingDogsDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      searchVirtualPairingDogs({
        field: "name",
        query: "%kide%",
        page: 1,
        pageSize: 10,
      }),
    ).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load virtual pairing search results.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
