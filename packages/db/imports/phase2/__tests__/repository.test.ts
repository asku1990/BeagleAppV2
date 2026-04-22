import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => {
  const legacyAkoeallUpsert = vi.fn();

  return {
    prismaMock: {
      legacyAkoeall: { upsert: legacyAkoeallUpsert, count: vi.fn() },
      legacyBealt: { upsert: vi.fn(), count: vi.fn() },
      legacyBealt0: { upsert: vi.fn(), count: vi.fn() },
      legacyBealt1: { upsert: vi.fn(), count: vi.fn() },
      legacyBealt2: { upsert: vi.fn(), count: vi.fn() },
      legacyBealt3: { upsert: vi.fn(), count: vi.fn() },
      $transaction: vi.fn((promises) => Promise.all(promises)),
    },
  };
});

vi.mock("../../../core/prisma", () => ({
  prisma: prismaMock,
}));

import { upsertLegacyTrialMirrorRowsDb } from "../repository";

describe("upsertLegacyTrialMirrorRowsDb", () => {
  beforeEach(() => {
    prismaMock.legacyAkoeall.upsert.mockReset();
    prismaMock.legacyBealt.upsert.mockReset();
    prismaMock.legacyBealt0.upsert.mockReset();
    prismaMock.legacyBealt1.upsert.mockReset();
    prismaMock.legacyBealt2.upsert.mockReset();
    prismaMock.legacyBealt3.upsert.mockReset();
    prismaMock.$transaction.mockClear();
  });

  it("upserts mirror akoeall rows by legacy composite key", async () => {
    await upsertLegacyTrialMirrorRowsDb({
      akoeall: [
        {
          rekno: "FI1/24",
          tappa: "Oulu",
          tappv: "20240101",
          kennelpiiri: null,
          kennelpiirinro: null,
          ke: null,
          lk: null,
          pa: null,
          piste: null,
          sija: null,
          haku: null,
          hauk: null,
          yva: null,
          hlo: null,
          alo: null,
          tja: null,
          pin: null,
          tuom1: null,
          muokattuRaw: "2024-01-01 12:00:00",
          vara: null,
          rawPayloadJson: '{"REKNO":"FI1/24"}',
          sourceHash: "a".repeat(64),
        },
      ],
      bealt: [],
      bealt0: [],
      bealt1: [],
      bealt2: [],
      bealt3: [],
    });

    expect(prismaMock.legacyAkoeall.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          rekno_tappa_tappv: {
            rekno: "FI1/24",
            tappa: "Oulu",
            tappv: "20240101",
          },
        },
        create: expect.objectContaining({
          rawPayloadJson: '{"REKNO":"FI1/24"}',
        }),
        update: expect.not.objectContaining({
          rekno: expect.anything(),
          tappa: expect.anything(),
          tappv: expect.anything(),
        }),
      }),
    );
  });
});
