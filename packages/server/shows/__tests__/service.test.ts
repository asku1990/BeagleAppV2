import { beforeEach, describe, expect, it, vi } from "vitest";
import { createShowsService } from "../service";
import { encodeShowId, parseShowId } from "../internal/show-id";

const { searchBeagleShowsDbMock, getBeagleShowDetailsDbMock } = vi.hoisted(
  () => ({
    searchBeagleShowsDbMock: vi.fn(),
    getBeagleShowDetailsDbMock: vi.fn(),
  }),
);

vi.mock("@beagle/db", () => ({
  searchBeagleShowsDb: searchBeagleShowsDbMock,
  getBeagleShowDetailsDb: getBeagleShowDetailsDbMock,
}));

describe("shows service", () => {
  beforeEach(() => {
    searchBeagleShowsDbMock.mockReset();
    getBeagleShowDetailsDbMock.mockReset();
  });

  it("returns 400 for invalid sort", async () => {
    const service = createShowsService();
    const result = await service.searchBeagleShows({
      sort: "bad-sort" as never,
    });

    expect(result).toEqual({
      status: 400,
      body: { ok: false, error: "Invalid sort value." },
    });
    expect(searchBeagleShowsDbMock).not.toHaveBeenCalled();
  });

  it("returns 400 for mixed year and range filters", async () => {
    const service = createShowsService();
    const result = await service.searchBeagleShows({
      year: 2025,
      dateFrom: "2025-01-01",
      dateTo: "2025-01-31",
    });

    expect(result).toEqual({
      status: 400,
      body: { ok: false, error: "Use either year or date range filter." },
    });
    expect(searchBeagleShowsDbMock).not.toHaveBeenCalled();
  });

  it("returns 400 for incomplete date range", async () => {
    const service = createShowsService();
    const result = await service.searchBeagleShows({
      dateFrom: "2025-01-01",
    });

    expect(result).toEqual({
      status: 400,
      body: { ok: false, error: "Both dateFrom and dateTo are required." },
    });
    expect(searchBeagleShowsDbMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid showId in details", async () => {
    const service = createShowsService();
    const result = await service.getBeagleShowDetails("invalid");

    expect(result).toEqual({
      status: 400,
      body: { ok: false, error: "Invalid show id." },
    });
    expect(getBeagleShowDetailsDbMock).not.toHaveBeenCalled();
  });

  it("uses latest year by default and maps encoded showId", async () => {
    searchBeagleShowsDbMock
      .mockResolvedValueOnce({
        mode: "range",
        year: null,
        dateFrom: null,
        dateTo: null,
        availableYears: [2025, 2024],
        total: 0,
        totalPages: 0,
        page: 1,
        items: [],
      })
      .mockResolvedValueOnce({
        mode: "year",
        year: 2025,
        dateFrom: null,
        dateTo: null,
        availableYears: [2025, 2024],
        total: 1,
        totalPages: 1,
        page: 1,
        items: [
          {
            eventDate: new Date("2025-06-01T00:00:00.000Z"),
            eventPlace: "Helsinki",
            judge: "Judge Main",
            dogCount: 5,
          },
        ],
      });

    const service = createShowsService();
    const result = await service.searchBeagleShows({});

    expect(searchBeagleShowsDbMock).toHaveBeenNthCalledWith(1, {
      mode: "range",
      page: 1,
      pageSize: 1,
      sort: "date-desc",
    });
    expect(searchBeagleShowsDbMock).toHaveBeenNthCalledWith(2, {
      mode: "year",
      year: 2025,
      page: 1,
      pageSize: 10,
      sort: "date-desc",
    });
    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected ok=true response");
    }
    expect(result.body.data.filters).toEqual({
      mode: "year",
      year: 2025,
      dateFrom: null,
      dateTo: null,
    });
    expect(parseShowId(result.body.data.items[0].showId)).toEqual({
      eventDateIsoDate: "2025-06-01",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
    });
  });

  it("returns 404 when show details are missing", async () => {
    getBeagleShowDetailsDbMock.mockResolvedValue(null);
    const service = createShowsService();
    const showId = encodeShowId("2025-06-01", "Helsinki");
    const result = await service.getBeagleShowDetails(showId);

    expect(result).toEqual({
      status: 404,
      body: { ok: false, error: "Show not found." },
    });
  });

  it("maps details and normalizes legacy result codes", async () => {
    getBeagleShowDetailsDbMock.mockResolvedValue({
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      judge: "Judge Main",
      dogCount: 1,
      items: [
        {
          id: "r1",
          dogId: "d1",
          registrationNo: "FI-1/20",
          name: "Aatu",
          sex: "U",
          result: "JUN1",
          heightCm: 40,
          judge: "Judge Main",
        },
      ],
    });

    const service = createShowsService();
    const showId = encodeShowId("2025-06-01", "Helsinki");
    const result = await service.getBeagleShowDetails(showId);

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected ok=true response");
    }
    expect(result.body.data.items[0]?.result).toBe("JUN-ERI");
  });

  it("returns 500 when db throws in shows search", async () => {
    searchBeagleShowsDbMock.mockRejectedValue(new Error("db fail"));
    const service = createShowsService();
    const result = await service.searchBeagleShows({ year: 2025 });

    expect(result).toEqual({
      status: 500,
      body: { ok: false, error: "Failed to load beagle shows." },
    });
  });

  it("returns 500 when db throws in show details", async () => {
    getBeagleShowDetailsDbMock.mockRejectedValue(new Error("db fail"));
    const service = createShowsService();
    const showId = encodeShowId("2025-06-01", "Helsinki");
    const result = await service.getBeagleShowDetails(showId);

    expect(result).toEqual({
      status: 500,
      body: { ok: false, error: "Failed to load show details." },
    });
  });
});
