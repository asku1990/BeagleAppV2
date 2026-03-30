import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  dogCountMock,
  dogAggregateMock,
  trialResultCountMock,
  trialResultAggregateMock,
  showEntryCountMock,
  showEventAggregateMock,
  prismaMock,
} = vi.hoisted(() => {
  const dogCount = vi.fn();
  const dogAggregate = vi.fn();
  const trialResultCount = vi.fn();
  const trialResultAggregate = vi.fn();
  const showEntryCount = vi.fn();
  const showEventAggregate = vi.fn();

  return {
    dogCountMock: dogCount,
    dogAggregateMock: dogAggregate,
    trialResultCountMock: trialResultCount,
    trialResultAggregateMock: trialResultAggregate,
    showEntryCountMock: showEntryCount,
    showEventAggregateMock: showEventAggregate,
    prismaMock: {
      dog: {
        count: dogCount,
        aggregate: dogAggregate,
      },
      trialResult: {
        count: trialResultCount,
        aggregate: trialResultAggregate,
      },
      showEntry: {
        count: showEntryCount,
      },
      showEvent: {
        aggregate: showEventAggregate,
      },
    },
  };
});

vi.mock("../../../core/prisma", () => ({
  prisma: prismaMock,
}));

import { getHomeStatisticsSnapshot } from "../get-home-statistics-snapshot";

describe("getHomeStatisticsSnapshot", () => {
  beforeEach(() => {
    dogCountMock.mockReset();
    dogAggregateMock.mockReset();
    trialResultCountMock.mockReset();
    trialResultAggregateMock.mockReset();
    showEntryCountMock.mockReset();
    showEventAggregateMock.mockReset();
  });

  it("counts only show events that have entries", async () => {
    dogCountMock.mockResolvedValue(12);
    dogAggregateMock.mockResolvedValue({
      _max: { birthDate: null },
    });
    trialResultCountMock.mockResolvedValue(3);
    trialResultAggregateMock.mockResolvedValue({
      _min: { eventDate: new Date("2025-01-01T00:00:00.000Z") },
      _max: { eventDate: new Date("2025-02-01T00:00:00.000Z") },
    });
    showEntryCountMock.mockResolvedValue(4);
    showEventAggregateMock.mockResolvedValue({
      _min: { eventDate: new Date("2025-03-01T00:00:00.000Z") },
      _max: { eventDate: new Date("2025-04-01T00:00:00.000Z") },
    });

    const result = await getHomeStatisticsSnapshot();

    expect(result.shows.resultsPeriodStart).toEqual(
      new Date("2025-03-01T00:00:00.000Z"),
    );
    expect(result.shows.resultsPeriodEnd).toEqual(
      new Date("2025-04-01T00:00:00.000Z"),
    );
    expect(showEventAggregateMock).toHaveBeenCalledWith({
      where: {
        entries: {
          some: {},
        },
      },
      _min: { eventDate: true },
      _max: { eventDate: true },
    });
  });
});
