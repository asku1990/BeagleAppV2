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
          ylituomariNimi: "Judge One",
          _count: { entries: 22 },
        },
      ]);
    trialEventCountMock.mockResolvedValue(1);

    const result = await searchAdminTrialsDb({
      dateFrom: new Date("2025-01-01T00:00:00.000Z"),
      dateTo: new Date("2026-01-01T00:00:00.000Z"),
      page: 1,
      pageSize: 50,
      sort: "date-desc",
    });

    expect(result).toEqual({
      availableEventDates: [
        new Date("2026-03-01T00:00:00.000Z"),
        new Date("2025-03-01T00:00:00.000Z"),
      ],
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
      dateFrom: new Date("2025-01-01T00:00:00.000Z"),
      dateTo: new Date("2026-01-01T00:00:00.000Z"),
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

  it("searches by dog names and registration numbers", async () => {
    trialEventFindManyMock.mockResolvedValue([]);
    trialEventCountMock.mockResolvedValue(0);

    await searchAdminTrialsDb({
      query: "Fido",
      dateFrom: new Date("2025-01-01T00:00:00.000Z"),
      dateTo: new Date("2026-01-01T00:00:00.000Z"),
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
                  entries: expect.objectContaining({
                    some: expect.objectContaining({
                      OR: expect.arrayContaining([
                        expect.objectContaining({
                          rekisterinumeroSnapshot: expect.objectContaining({
                            contains: "Fido",
                          }),
                        }),
                        expect.objectContaining({
                          dog: expect.objectContaining({
                            is: expect.objectContaining({
                              name: expect.objectContaining({
                                contains: "Fido",
                              }),
                            }),
                          }),
                        }),
                        expect.objectContaining({
                          dog: expect.objectContaining({
                            is: expect.objectContaining({
                              registrations: expect.objectContaining({
                                some: expect.objectContaining({
                                  registrationNo: expect.objectContaining({
                                    contains: "Fido",
                                  }),
                                }),
                              }),
                            }),
                          }),
                        }),
                      ]),
                    }),
                  }),
                }),
              ]),
            }),
          ]),
        }),
      }),
    );
  });

  it("does not search by rotukoodi", async () => {
    trialEventFindManyMock.mockResolvedValue([]);
    trialEventCountMock.mockResolvedValue(0);

    await searchAdminTrialsDb({
      query: "161/1",
      dateFrom: new Date("2025-01-01T00:00:00.000Z"),
      dateTo: new Date("2026-01-01T00:00:00.000Z"),
      page: 1,
      pageSize: 50,
      sort: "date-desc",
    });

    const secondCall = trialEventFindManyMock.mock.calls[1]?.[0];
    expect(JSON.stringify(secondCall?.where)).not.toContain("rotukoodi");
  });
});
