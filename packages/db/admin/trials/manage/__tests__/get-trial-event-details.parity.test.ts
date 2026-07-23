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
      trialRuleWindowId: "trw_post_20230801",
      sklKoeId: 1001,
      koepaiva: new Date("2026-03-01T00:00:00.000Z"),
      koekunta: "Helsinki",
      jarjestaja: "Talvikoe",
      ylituomariNimi: "Judge One",
      ylituomariNumero: null,
      ytKertomus: null,
      kennelpiiri: null,
      kennelpiirinro: null,
      entries: [
        {
          id: "trial-1",
          dogId: "dog-1",
          yksilointiAvain: "entry-1",
          rekisterinumeroSnapshot: "FI123",
          koemuoto: "AJOK",
          koetyyppi: "NORMAL",
          sija: "1",
          pa: "VOI1",
          koemaasto: null,
          koiriaLuokassa: null,
          ke: null,
          lk: null,
          piste: { valueOf: () => 92.5 },
          hyvaksytytAjominuutit: null,
          ajoajanPisteet: null,
          haku: null,
          hauk: null,
          yva: null,
          hlo: null,
          alo: null,
          tja: null,
          pin: null,
          ansiopisteetYhteensa: null,
          tappiopisteetYhteensa: null,
          tuom1: "Group Judge",
          huomautus: null,
          huomautusTeksti: null,
          ylituomariNumeroSnapshot: null,
          ryhmatuomariNimi: null,
          palkintotuomariNimi: null,
          omistajaSnapshot: null,
          omistajanKotikuntaSnapshot: null,
          eras: [],
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
      trialRuleWindowId: "trw_post_20230801",
      eventDate: new Date("2026-03-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      eventName: "Talvikoe",
      jarjestaja: "Talvikoe",
      ylituomari: "Judge One",
      ylituomariNumero: null,
      ytKertomus: null,
      kennelpiiri: null,
      kennelpiirinro: null,
      sklKoeId: 1001,
      entries: [
        {
          trialId: "trial-1",
          dogId: "dog-1",
          dogName: "Rex",
          registrationNo: "FI123",
          entryKey: "entry-1",
          koemuoto: "AJOK",
          koetyyppi: "NORMAL",
          rank: "1",
          award: "VOI1",
          points: 92.5,
          judge: "Group Judge",
          koemaasto: null,
          koiriaLuokassa: null,
          ke: null,
          lk: null,
          hyvaksytytAjominuutit: null,
          ajoajanPisteet: null,
          haku: null,
          hauk: null,
          yva: null,
          hlo: null,
          alo: null,
          tja: null,
          pin: null,
          ansiopisteetYhteensa: null,
          tappiopisteetYhteensa: null,
          huomautus: null,
          huomautusTeksti: null,
          ylituomariNumeroSnapshot: null,
          ryhmatuomariNimi: null,
          palkintotuomariNimi: null,
          omistajaSnapshot: null,
          omistajanKotikuntaSnapshot: null,
          eras: [],
        },
      ],
    });
  });
});
