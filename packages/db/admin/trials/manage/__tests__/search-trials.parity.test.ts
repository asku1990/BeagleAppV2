import { beforeEach, describe, expect, it, vi } from "vitest";

const { trialEventFindManyMock, trialEventCountMock, prismaMock } = vi.hoisted(
  () => {
    const trialEventFindMany = vi.fn();
    const trialEventCount = vi.fn();

    return {
      trialEventFindManyMock: trialEventFindMany,
      trialEventCountMock: trialEventCount,
      prismaMock: {
        trialEvent: {
          findMany: trialEventFindMany,
          count: trialEventCount,
        },
      },
    };
  },
);

vi.mock("../../../../core/prisma", () => ({
  prisma: prismaMock,
}));

import { searchAdminTrialsDb } from "../search-trials";

describe("searchAdminTrialsDb event parity", () => {
  beforeEach(() => {
    trialEventFindManyMock.mockReset();
    trialEventCountMock.mockReset();
  });

  it("maps canonical trial events to event-summary rows", async () => {
    trialEventFindManyMock
      .mockResolvedValueOnce([
        { koepaiva: new Date("2026-03-01T00:00:00.000Z") },
        { koepaiva: new Date("2025-03-01T00:00:00.000Z") },
      ])
      .mockResolvedValueOnce([
        {
          id: "event-1",
          sklKoeId: 1001,
          koepaiva: new Date("2026-03-01T00:00:00.000Z"),
          koekunta: "Helsinki",
          jarjestaja: "Talvikoe",
          koemuoto: "AJOK",
          ylituomariNimi: "Judge One",
          _count: { entries: 22 },
        },
      ]);
    trialEventCountMock.mockResolvedValue(1);

    const result = await searchAdminTrialsDb({
      mode: "year",
      year: 2026,
      page: 1,
      pageSize: 50,
      sort: "date-desc",
    });

    expect(result).toEqual({
      mode: "year",
      year: 2026,
      dateFrom: null,
      dateTo: null,
      availableYears: [2026, 2025],
      total: 1,
      totalPages: 1,
      page: 1,
      items: [
        {
          trialEventId: "event-1",
          eventDate: new Date("2026-03-01T00:00:00.000Z"),
          eventPlace: "Helsinki",
          eventName: "Talvikoe",
          organizer: "Talvikoe",
          judge: "Judge One",
          sklKoeId: 1001,
          dogCount: 22,
        },
      ],
    });
  });

  it("searches by event organizer and SKL id", async () => {
    trialEventFindManyMock.mockResolvedValue([]);
    trialEventCountMock.mockResolvedValue(0);

    await searchAdminTrialsDb({
      query: "1001",
      mode: "year",
      year: 2026,
      page: 1,
      pageSize: 50,
      sort: "date-desc",
    });

    const secondCall = trialEventFindManyMock.mock.calls[1]?.[0];
    expect(secondCall).toEqual(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({
                  sklKoeId: 1001,
                }),
              ]),
            }),
          ]),
        }),
      }),
    );
  });
});
