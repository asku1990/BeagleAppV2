import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  dogCountMock,
  dogAggregateMock,
  trialEntryCountMock,
  trialEventAggregateMock,
  showEntryCountMock,
  showEventAggregateMock,
  prismaMock,
} = vi.hoisted(() => {
  const dogCount = vi.fn();
  const dogAggregate = vi.fn();
  const trialEntryCount = vi.fn();
  const trialEventAggregate = vi.fn();
  const showEntryCount = vi.fn();
  const showEventAggregate = vi.fn();

  return {
    dogCountMock: dogCount,
    dogAggregateMock: dogAggregate,
    trialEntryCountMock: trialEntryCount,
    trialEventAggregateMock: trialEventAggregate,
    showEntryCountMock: showEntryCount,
    showEventAggregateMock: showEventAggregate,
    prismaMock: {
      dog: {
        count: dogCount,
        aggregate: dogAggregate,
      },
      trialEntry: {
        count: trialEntryCount,
      },
      trialEvent: {
        aggregate: trialEventAggregate,
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
    trialEntryCountMock.mockReset();
    trialEventAggregateMock.mockReset();
    showEntryCountMock.mockReset();
    showEventAggregateMock.mockReset();

    dogCountMock.mockResolvedValue(0);
    dogAggregateMock.mockResolvedValue({ _max: { birthDate: null } });
    trialEntryCountMock.mockResolvedValue(0);
    trialEventAggregateMock.mockResolvedValue({
      _min: { koepaiva: null },
      _max: { koepaiva: null },
    });
    showEntryCountMock.mockResolvedValue(0);
    showEventAggregateMock.mockResolvedValue({
      _min: { eventDate: null },
      _max: { eventDate: null },
    });
  });

  it("reads trial stats from TrialEntry and TrialEvent, not TrialResult", async () => {
    trialEntryCountMock.mockResolvedValue(42);
    trialEventAggregateMock.mockResolvedValue({
      _min: { koepaiva: new Date("2025-01-01T00:00:00.000Z") },
      _max: { koepaiva: new Date("2025-06-01T00:00:00.000Z") },
    });
    dogCountMock
      .mockResolvedValueOnce(10) // registeredDogs
      .mockResolvedValueOnce(7); // performedByDogs (trialEntries)

    const result = await getHomeStatisticsSnapshot();

    expect(result.trials.totalEntries).toBe(42);
    expect(result.trials.performedByDogs).toBe(7);
    expect(result.trials.resultsPeriodStart).toEqual(
      new Date("2025-01-01T00:00:00.000Z"),
    );
    expect(result.trials.resultsPeriodEnd).toEqual(
      new Date("2025-06-01T00:00:00.000Z"),
    );

    // performedByDogs uses the canonical trialEntries relation
    expect(dogCountMock).toHaveBeenCalledWith({
      where: { trialEntries: { some: {} } },
    });

    // date range excludes TrialEvent rows with no entries
    expect(trialEventAggregateMock).toHaveBeenCalledWith({
      where: { entries: { some: {} } },
      _min: { koepaiva: true },
      _max: { koepaiva: true },
    });
  });

  it("counts only show events that have entries", async () => {
    dogCountMock.mockResolvedValue(12);
    dogAggregateMock.mockResolvedValue({ _max: { birthDate: null } });
    trialEntryCountMock.mockResolvedValue(3);
    trialEventAggregateMock.mockResolvedValue({
      _min: { koepaiva: new Date("2025-01-01T00:00:00.000Z") },
      _max: { koepaiva: new Date("2025-02-01T00:00:00.000Z") },
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
      where: { entries: { some: {} } },
      _min: { eventDate: true },
      _max: { eventDate: true },
    });
  });
});
