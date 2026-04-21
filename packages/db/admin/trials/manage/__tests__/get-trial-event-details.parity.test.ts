import { beforeEach, describe, expect, it, vi } from "vitest";

const { trialEventFindUniqueMock, prismaMock } = vi.hoisted(() => {
  const trialEventFindUnique = vi.fn();

  return {
    trialEventFindUniqueMock: trialEventFindUnique,
    prismaMock: {
      trialEvent: {
        findUnique: trialEventFindUnique,
      },
    },
  };
});

vi.mock("../../../../core/prisma", () => ({
  prisma: prismaMock,
}));

import { getAdminTrialEventDetailsDb } from "../get-trial-event-details";

describe("getAdminTrialEventDetailsDb parity", () => {
  beforeEach(() => {
    trialEventFindUniqueMock.mockReset();
  });

  it("returns null when event is missing", async () => {
    trialEventFindUniqueMock.mockResolvedValue(null);

    const result = await getAdminTrialEventDetailsDb({
      trialEventId: "missing",
    });

    expect(result).toBeNull();
  });

  it("maps event entries and decimal points", async () => {
    trialEventFindUniqueMock.mockResolvedValue({
      id: "event-1",
      sklKoeId: 1001,
      koepaiva: new Date("2026-03-01T00:00:00.000Z"),
      koekunta: "Helsinki",
      jarjestaja: "Talvikoe",
      koemuoto: "AJOK",
      ylituomariNimi: "Judge One",
      entries: [
        {
          id: "trial-1",
          dogId: "dog-1",
          yksilointiAvain: "entry-1",
          rekisterinumeroSnapshot: "FI123",
          sijoitus: "1",
          palkinto: "VOI1",
          loppupisteet: { valueOf: () => 92.5 },
          ryhmatuomariNimi: "Group Judge",
          dog: {
            name: "Rex",
            registrations: [{ registrationNo: "FI999" }],
          },
        },
      ],
    });

    const result = await getAdminTrialEventDetailsDb({
      trialEventId: "event-1",
    });

    expect(result).toEqual({
      trialEventId: "event-1",
      eventDate: new Date("2026-03-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      eventName: "Talvikoe",
      organizer: "Talvikoe",
      judge: "Judge One",
      sklKoeId: 1001,
      koemuoto: "AJOK",
      entries: [
        {
          trialId: "trial-1",
          dogId: "dog-1",
          dogName: "Rex",
          registrationNo: "FI123",
          entryKey: "entry-1",
          rank: "1",
          award: "VOI1",
          points: 92.5,
          judge: "Group Judge",
        },
      ],
    });
  });
});
