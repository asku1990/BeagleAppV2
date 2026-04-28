import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    trialEntry: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@db/core/prisma", () => ({
  prisma: prismaMock,
}));

import { getTrialDogPdfDataDb } from "../get-trial-dog-pdf-data";

function decimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

function trialRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "entry-1",
    rekisterinumeroSnapshot: "FI123",
    omistajaSnapshot: null,
    omistajanKotikuntaSnapshot: null,
    koemaasto: null,
    ke: null,
    pa: null,
    piste: null,
    sija: null,
    huomautus: null,
    huomautusTeksti: null,
    ylituomariNimiSnapshot: null,
    ylituomariNumeroSnapshot: null,
    ryhmatuomariNimi: null,
    palkintotuomariNimi: null,
    hyvaksytytAjominuutit: null,
    ajoajanPisteet: null,
    haku: decimal(8.5),
    hauk: decimal(6.75),
    yva: decimal(9.25),
    hlo: decimal(2.5),
    alo: decimal(1.5),
    pin: decimal(12.5),
    ansiopisteetYhteensa: decimal(36.75),
    tappiopisteetYhteensa: decimal(4),
    tuom1: null,
    dog: null,
    trialEvent: {
      trialRuleWindowId: "trw_post_20230801",
      kennelpiiri: null,
      kennelpiirinro: null,
      koekunta: "Koe",
      koepaiva: new Date("2025-09-07T00:00:00.000Z"),
      jarjestaja: null,
    },
    eras: [
      {
        era: 1,
        alkoi: null,
        hakumin: null,
        ajomin: 51,
        haku: null,
        hauk: null,
        pin: decimal(3.5),
        yva: null,
        hlo: null,
        alo: null,
        lisatiedot: [],
      },
      {
        era: 2,
        alkoi: null,
        hakumin: null,
        ajomin: null,
        haku: null,
        hauk: null,
        pin: decimal(4.5),
        yva: null,
        hlo: null,
        alo: null,
        lisatiedot: [],
      },
    ],
    ...overrides,
  };
}

describe("getTrialDogPdfDataDb", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses stored accepted driving minutes and driving time points first", async () => {
    prismaMock.trialEntry.findUnique.mockResolvedValue(
      trialRow({
        hyvaksytytAjominuutit: 60,
        ajoajanPisteet: decimal(17.5),
      }),
    );

    const result = await getTrialDogPdfDataDb({ trialId: "entry-1" });

    expect(result).toMatchObject({
      hyvaksytytAjominuutit: 60,
      ajoajanPisteet: 17.5,
      haku: 8.5,
      hauk: 6.75,
      yva: 9.25,
      hlo: 2.5,
      alo: 1.5,
      pin: 12.5,
      eras: [
        expect.objectContaining({ era: 1, pin: 3.5 }),
        expect.objectContaining({ era: 2, pin: 4.5 }),
      ],
      ansiopisteetYhteensa: 36.75,
      tappiopisteetYhteensa: 4,
      trialRuleWindowId: "trw_post_20230801",
    });
  });

  it("returns the trial event rule window id", async () => {
    prismaMock.trialEntry.findUnique.mockResolvedValue(
      trialRow({
        trialEvent: {
          trialRuleWindowId: "trw_range_2005_2011",
          kennelpiiri: null,
          kennelpiirinro: null,
          koekunta: "Koe",
          koepaiva: new Date("2008-09-07T00:00:00.000Z"),
          jarjestaja: null,
        },
      }),
    );

    const result = await getTrialDogPdfDataDb({ trialId: "entry-1" });

    expect(result?.trialRuleWindowId).toBe("trw_range_2005_2011");
  });

  it("returns null stored driving totals for legacy rows without source values", async () => {
    prismaMock.trialEntry.findUnique.mockResolvedValue(
      trialRow({
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        pin: null,
        ansiopisteetYhteensa: null,
        tappiopisteetYhteensa: null,
      }),
    );

    const result = await getTrialDogPdfDataDb({ trialId: "entry-1" });

    expect(result).toMatchObject({
      hyvaksytytAjominuutit: null,
      ajoajanPisteet: null,
      haku: null,
      hauk: null,
      yva: null,
      hlo: null,
      alo: null,
      pin: null,
      ansiopisteetYhteensa: null,
      tappiopisteetYhteensa: null,
    });
  });
});
