import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTrialsService } from "../service";
import { encodeTrialId, parseTrialId } from "../internal/trial-id";

const { searchBeagleTrialsDbMock, getBeagleTrialDetailsDbMock } = vi.hoisted(
  () => ({
    searchBeagleTrialsDbMock: vi.fn(),
    getBeagleTrialDetailsDbMock: vi.fn(),
  }),
);

vi.mock("@beagle/db", () => ({
  searchBeagleTrialsDb: searchBeagleTrialsDbMock,
  getBeagleTrialDetailsDb: getBeagleTrialDetailsDbMock,
}));

describe("trials service", () => {
  beforeEach(() => {
    searchBeagleTrialsDbMock.mockReset();
    getBeagleTrialDetailsDbMock.mockReset();
  });

  it("returns 400 for invalid sort", async () => {
    const service = createTrialsService();
    const result = await service.searchBeagleTrials({
      sort: "bad-sort" as never,
    });

    expect(result).toEqual({
      status: 400,
      body: { ok: false, error: "Invalid sort value." },
    });
  });

  it("returns 400 for mixed year and range filters", async () => {
    const service = createTrialsService();
    const result = await service.searchBeagleTrials({
      year: 2025,
      dateFrom: "2025-01-01",
      dateTo: "2025-01-31",
    });

    expect(result).toEqual({
      status: 400,
      body: { ok: false, error: "Use either year or date range filter." },
    });
  });

  it("returns 400 for invalid trialId in details", async () => {
    const service = createTrialsService();
    const result = await service.getBeagleTrialDetails("invalid");

    expect(result).toEqual({
      status: 400,
      body: { ok: false, error: "Invalid trial id." },
    });
  });

  it("uses latest year by default and maps encoded trialId", async () => {
    searchBeagleTrialsDbMock
      .mockResolvedValueOnce({
        availableEventDates: [new Date("2025-06-01T00:00:00.000Z")],
        total: 0,
        totalPages: 0,
        page: 1,
        items: [],
      })
      .mockResolvedValueOnce({
        availableEventDates: [
          new Date("2025-06-01T00:00:00.000Z"),
          new Date("2024-06-01T00:00:00.000Z"),
        ],
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

    const service = createTrialsService();
    const result = await service.searchBeagleTrials({});

    expect(result.status).toBe(200);
    if (!result.body.ok) throw new Error("Expected ok=true");

    expect(parseTrialId(result.body.data.items[0].trialId)).toEqual({
      eventDateIsoDate: "2025-06-01",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
    });
    expect(searchBeagleTrialsDbMock).toHaveBeenNthCalledWith(1, {
      page: 1,
      pageSize: 1,
      sort: "date-desc",
    });
    expect(searchBeagleTrialsDbMock).toHaveBeenNthCalledWith(2, {
      dateFrom: new Date("2024-12-31T22:00:00.000Z"),
      dateTo: new Date("2025-12-31T22:00:00.000Z"),
      page: 1,
      pageSize: 10,
      sort: "date-desc",
    });
  });

  it("normalizes range searches to business-timezone boundaries", async () => {
    searchBeagleTrialsDbMock.mockResolvedValue({
      availableEventDates: [new Date("2026-06-01T00:00:00.000Z")],
      total: 1,
      totalPages: 1,
      page: 1,
      items: [],
    });

    const service = createTrialsService();
    const result = await service.searchBeagleTrials({
      dateFrom: "2026-06-01",
      dateTo: "2026-06-30",
      sort: "date-asc",
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) throw new Error("Expected ok=true");

    expect(result.body.data.filters).toEqual({
      mode: "range",
      year: null,
      dateFrom: "2026-06-01",
      dateTo: "2026-06-30",
    });
    expect(searchBeagleTrialsDbMock).toHaveBeenCalledWith({
      dateFrom: new Date("2026-05-31T21:00:00.000Z"),
      dateTo: new Date("2026-06-30T21:00:00.000Z"),
      page: 1,
      pageSize: 10,
      sort: "date-asc",
    });
  });

  it("returns 404 when trial details are missing", async () => {
    getBeagleTrialDetailsDbMock.mockResolvedValue(null);
    const service = createTrialsService();
    const trialId = encodeTrialId("2025-06-01", "Helsinki");
    const result = await service.getBeagleTrialDetails(trialId);

    expect(result).toEqual({
      status: 404,
      body: { ok: false, error: "Trial not found." },
    });
  });

  it("maps details and formats award", async () => {
    getBeagleTrialDetailsDbMock.mockResolvedValue({
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
          weather: "L",
          award: "1",
          classCode: "V",
          rank: "1",
          points: 88.5,
          judge: "Judge Main",
          haku: null,
          hauk: null,
          yva: null,
          hlo: null,
          alo: null,
          tja: null,
          pin: null,
          legacyFlag: null,
          sourceKey: "src_1",
          createdAt: new Date("2025-06-01T00:00:00.000Z"),
          updatedAt: new Date("2025-06-01T00:00:00.000Z"),
        },
      ],
    });

    const service = createTrialsService();
    const trialId = encodeTrialId("2025-06-01", "Helsinki");
    const result = await service.getBeagleTrialDetails(trialId);

    expect(result.status).toBe(200);
    if (!result.body.ok) throw new Error("Expected ok=true");

    expect(result.body.data.items[0]?.award).toBe("Voi 1");
    expect(result.body.data.trial.trialId).toBe(trialId);
    expect(getBeagleTrialDetailsDbMock).toHaveBeenCalledWith({
      eventDateStart: new Date("2025-05-31T21:00:00.000Z"),
      eventDateEndExclusive: new Date("2025-06-01T21:00:00.000Z"),
      eventPlace: "Helsinki",
    });
  });

  it("returns 500 when db throws", async () => {
    searchBeagleTrialsDbMock.mockRejectedValue(new Error("db fail"));
    const service = createTrialsService();
    const result = await service.searchBeagleTrials({ year: 2025 });

    expect(result).toEqual({
      status: 500,
      body: { ok: false, error: "Failed to load beagle trials." },
    });
  });
});
