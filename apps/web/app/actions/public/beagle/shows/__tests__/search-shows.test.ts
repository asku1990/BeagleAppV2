import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchBeagleShowsAction } from "../search-shows";

const {
  createActionLoggerMock,
  searchBeagleShowsMock,
  infoLogMock,
  warnLogMock,
  errorLogMock,
} = vi.hoisted(() => ({
  createActionLoggerMock: vi.fn(),
  searchBeagleShowsMock: vi.fn(),
  infoLogMock: vi.fn(),
  warnLogMock: vi.fn(),
  errorLogMock: vi.fn(),
}));

vi.mock("@/lib/server/action-logger", () => ({
  createActionLogger: createActionLoggerMock,
}));

vi.mock("@beagle/server", () => ({
  showsService: {
    searchBeagleShows: searchBeagleShowsMock,
  },
  toErrorLog: (error: unknown) => ({ error }),
}));

describe("searchBeagleShowsAction", () => {
  beforeEach(() => {
    createActionLoggerMock.mockReset();
    searchBeagleShowsMock.mockReset();
    infoLogMock.mockReset();
    warnLogMock.mockReset();
    errorLogMock.mockReset();

    createActionLoggerMock.mockResolvedValue({
      log: {
        info: infoLogMock,
        warn: warnLogMock,
        error: errorLogMock,
      },
      requestId: "req_1",
    });
  });

  it("returns data on success", async () => {
    searchBeagleShowsMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          filters: {
            mode: "year",
            year: 2025,
            dateFrom: null,
            dateTo: null,
          },
          availableYears: [2025],
          total: 1,
          totalPages: 1,
          page: 1,
          items: [
            {
              showId: "s_1",
              eventDate: "2025-06-01",
              eventPlace: "Helsinki",
              judge: "Judge Main",
              dogCount: 10,
            },
          ],
        },
      },
    });

    await expect(
      searchBeagleShowsAction({ year: 2025, page: 1, pageSize: 10 }),
    ).resolves.toEqual({
      data: {
        filters: {
          mode: "year",
          year: 2025,
          dateFrom: null,
          dateTo: null,
        },
        availableYears: [2025],
        total: 1,
        totalPages: 1,
        page: 1,
        items: [
          {
            showId: "s_1",
            eventDate: "2025-06-01",
            eventPlace: "Helsinki",
            judge: "Judge Main",
            dogCount: 10,
          },
        ],
      },
      hasError: false,
      status: 200,
    });

    expect(searchBeagleShowsMock).toHaveBeenCalledWith(
      { year: 2025, page: 1, pageSize: 10 },
      { requestId: "req_1" },
    );
  });

  it("returns service error payload", async () => {
    searchBeagleShowsMock.mockResolvedValue({
      status: 400,
      body: {
        ok: false,
        error: "Invalid year value.",
      },
    });

    await expect(searchBeagleShowsAction({ year: 1800 })).resolves.toEqual({
      data: null,
      hasError: true,
      status: 400,
      error: "Invalid year value.",
    });

    expect(warnLogMock).toHaveBeenCalled();
  });

  it("returns 500 payload when service throws", async () => {
    searchBeagleShowsMock.mockRejectedValue(new Error("boom"));

    await expect(searchBeagleShowsAction({ year: 2025 })).resolves.toEqual({
      data: null,
      hasError: true,
      status: 500,
      error: "Failed to load beagle shows.",
    });

    expect(errorLogMock).toHaveBeenCalled();
  });
});
