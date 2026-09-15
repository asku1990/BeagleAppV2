import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTrialsService } from "../service";
import { getTrialDateOnlyStartUtc } from "../core/date-only";

const {
  searchBeagleTrialsDbMock,
  getBeagleTrialAwardSummaryDbMock,
  getBeagleTrialSearchSummaryDbMock,
  getBeagleTrialDetailsDbMock,
} = vi.hoisted(() => ({
  searchBeagleTrialsDbMock: vi.fn(),
  getBeagleTrialAwardSummaryDbMock: vi.fn(),
  getBeagleTrialSearchSummaryDbMock: vi.fn(),
  getBeagleTrialDetailsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  searchBeagleTrialsDb: searchBeagleTrialsDbMock,
  getBeagleTrialAwardSummaryDb: getBeagleTrialAwardSummaryDbMock,
  getBeagleTrialSearchSummaryDb: getBeagleTrialSearchSummaryDbMock,
  getBeagleTrialDetailsDb: getBeagleTrialDetailsDbMock,
}));

describe("trials service", () => {
  beforeEach(() => {
    searchBeagleTrialsDbMock.mockReset();
    getBeagleTrialAwardSummaryDbMock.mockReset();
    getBeagleTrialAwardSummaryDbMock.mockResolvedValue([]);
    getBeagleTrialSearchSummaryDbMock.mockReset();
    getBeagleTrialSearchSummaryDbMock.mockResolvedValue({
      trialCount: 0,
      entryCount: 0,
      awarded: 0,
      first: 0,
      second: 0,
      third: 0,
      noPrize: 0,
      withdrew: 0,
      excluded: 0,
    });
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

  it("returns 400 for blank trialId in details", async () => {
    const service = createTrialsService();
    const result = await service.getBeagleTrialDetails("   ");

    expect(result).toEqual({
      status: 400,
      body: { ok: false, error: "Invalid trial id." },
    });
  });

  it("uses latest year by default and maps canonical trialId", async () => {
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
            trialEventId: "event-1",
            eventDate: new Date("2025-06-01T00:00:00.000Z"),
            eventPlace: "Helsinki",
            judge: "Judge Main",
            dogCount: 5,
            weather: { kind: "single", value: "L" },
            average: 81,
          },
        ],
      });

    const service = createTrialsService();
    const result = await service.searchBeagleTrials({});

    expect(result.status).toBe(200);
    if (!result.body.ok) throw new Error("Expected ok=true");

    expect(result.body.data.items[0].trialId).toBe("event-1");
    expect(searchBeagleTrialsDbMock).toHaveBeenNthCalledWith(1, {
      page: 1,
      pageSize: 1,
      sort: "date-desc",
    });
    expect(searchBeagleTrialsDbMock).toHaveBeenNthCalledWith(2, {
      dateFrom: new Date("2025-01-01T00:00:00.000Z"),
      dateTo: new Date("2026-01-01T00:00:00.000Z"),
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
      dateFrom: getTrialDateOnlyStartUtc("2026-06-01"),
      dateTo: getTrialDateOnlyStartUtc("2026-07-01"),
      page: 1,
      pageSize: 10,
      sort: "date-asc",
    });
  });

  it("maps the all-time award summary independently of listing filters", async () => {
    searchBeagleTrialsDbMock.mockResolvedValue({
      availableEventDates: [new Date("2026-06-01T00:00:00.000Z")],
      total: 1,
      totalPages: 1,
      page: 1,
      items: [],
    });
    getBeagleTrialAwardSummaryDbMock.mockResolvedValue([
      {
        trialType: "normal",
        first: 1,
        second: 2,
        third: 3,
        noPrize: 4,
        withdrew: 1,
        excluded: 0,
        total: 12,
        firstDate: new Date("2005-08-20T00:00:00.000Z"),
        lastDate: new Date("2026-02-28T00:00:00.000Z"),
      },
    ]);

    const result = await createTrialsService().searchBeagleTrials({
      year: 2026,
    });

    expect(getBeagleTrialAwardSummaryDbMock).toHaveBeenCalledWith();
    expect(result.status).toBe(200);
    if (!result.body.ok) throw new Error("Expected ok=true");
    expect(result.body.data.awardSummary).toEqual({
      dateFrom: "2005-08-20",
      dateTo: "2026-02-28",
      rows: [
        {
          trialType: "normal",
          first: { count: 1, percentage: 8.333333333333332 },
          second: { count: 2, percentage: 16.666666666666664 },
          third: { count: 3, percentage: 25 },
          noPrize: { count: 4, percentage: 33.33333333333333 },
          withdrew: { count: 1, percentage: 8.333333333333332 },
          excluded: { count: 0, percentage: 0 },
          awarded: { count: 6, percentage: 50 },
          total: 12,
        },
      ],
    });
  });

  it("maps the filtered search summary using the resolved year range", async () => {
    searchBeagleTrialsDbMock.mockResolvedValue({
      availableEventDates: [new Date("2026-06-01T00:00:00.000Z")],
      total: 1,
      totalPages: 1,
      page: 1,
      items: [],
    });
    getBeagleTrialSearchSummaryDbMock.mockResolvedValue({
      trialCount: 2,
      entryCount: 10,
      awarded: 6,
      first: 2,
      second: 1,
      third: 3,
      noPrize: 2,
      withdrew: 1,
      excluded: 1,
    });

    const result = await createTrialsService().searchBeagleTrials({
      year: 2026,
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) throw new Error("Expected ok=true");
    expect(result.body.data.searchSummary).toEqual({
      trialCount: 2,
      entryCount: 10,
      awarded: { count: 6, percentage: 60 },
      first: { count: 2, percentage: 20 },
      second: { count: 1, percentage: 10 },
      third: { count: 3, percentage: 30 },
      noPrize: { count: 2, percentage: 20 },
      withdrew: { count: 1, percentage: 10 },
      excluded: { count: 1, percentage: 10 },
    });
    expect(getBeagleTrialSearchSummaryDbMock).toHaveBeenCalledWith({
      dateFrom: new Date("2026-01-01T00:00:00.000Z"),
      dateTo: new Date("2027-01-01T00:00:00.000Z"),
    });
  });

  it("omits the award summary when both trial types are empty", async () => {
    searchBeagleTrialsDbMock.mockResolvedValue({
      availableEventDates: [],
      total: 0,
      totalPages: 0,
      page: 1,
      items: [],
    });
    getBeagleTrialAwardSummaryDbMock.mockResolvedValue(
      ["normal", "long"].map((trialType) => ({
        trialType,
        first: 0,
        second: 0,
        third: 0,
        noPrize: 0,
        withdrew: 0,
        excluded: 0,
        total: 0,
        firstDate: null,
        lastDate: null,
      })),
    );

    const result = await createTrialsService().searchBeagleTrials({
      year: 2026,
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) throw new Error("Expected ok=true");
    expect(result.body.data.awardSummary).toEqual({
      dateFrom: null,
      dateTo: null,
      rows: [],
    });
  });

  it("returns 404 when trial details are missing", async () => {
    getBeagleTrialDetailsDbMock.mockResolvedValue(null);
    const service = createTrialsService();
    const result = await service.getBeagleTrialDetails("event-404");

    expect(result).toEqual({
      status: 404,
      body: { ok: false, error: "Trial not found." },
    });
  });

  it("maps details and formats award", async () => {
    getBeagleTrialDetailsDbMock.mockResolvedValue({
      trialEventId: "event-1",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      judge: "Judge Main",
      dogCount: 1,
      items: [
        {
          id: "r1",
          trialRuleWindowId: "trw_post_20230801",
          dogId: "d1",
          registrationNo: "FI-1/20",
          name: "Aatu",
          sex: "U",
          weather: { kind: "single", value: "L" },
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
        },
      ],
    });

    const service = createTrialsService();
    const result = await service.getBeagleTrialDetails("event-1");

    expect(result.status).toBe(200);
    if (!result.body.ok) throw new Error("Expected ok=true");

    expect(result.body.data.items[0]?.award).toBe("Voi 1");
    expect(result.body.data.items[0]?.trialRuleWindowId).toBe(
      "trw_post_20230801",
    );
    expect(result.body.data.trial.trialId).toBe("event-1");
    expect(getBeagleTrialDetailsDbMock).toHaveBeenCalledWith({
      trialEventId: "event-1",
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
