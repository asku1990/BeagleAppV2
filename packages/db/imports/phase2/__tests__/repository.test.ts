import { beforeEach, describe, expect, it, vi } from "vitest";

const { trialEventUpsertMock, prismaMock } = vi.hoisted(() => {
  const trialEventUpsert = vi.fn();

  return {
    trialEventUpsertMock: trialEventUpsert,
    prismaMock: {
      trialEvent: { upsert: trialEventUpsert },
      trialEntry: { upsert: vi.fn() },
      trialResult: { count: vi.fn() },
      dogRegistration: { findMany: vi.fn() },
    },
  };
});

vi.mock("../../../core/prisma", () => ({
  prisma: prismaMock,
}));

import { upsertTrialEventByLegacyKeyDb } from "../repository";

describe("upsertTrialEventByLegacyKeyDb", () => {
  beforeEach(() => {
    trialEventUpsertMock.mockReset();
    trialEventUpsertMock.mockResolvedValue({ id: "event-1" });
  });

  it("does not overwrite existing judge with null on update", async () => {
    await upsertTrialEventByLegacyKeyDb({
      legacyEventKey: "2024-01-07|oulu|pk|08",
      koepaiva: new Date("2024-01-07T00:00:00.000Z"),
      koekunta: "Oulu",
      kennelpiiri: "PK",
      kennelpiirinro: "08",
      ylituomariNimi: null,
    });

    const call = trialEventUpsertMock.mock.calls[0]?.[0];
    expect(call.update).not.toHaveProperty("ylituomariNimi");
  });

  it("updates judge when a non-null value is provided", async () => {
    await upsertTrialEventByLegacyKeyDb({
      legacyEventKey: "2024-01-07|oulu|pk|08",
      koepaiva: new Date("2024-01-07T00:00:00.000Z"),
      koekunta: "Oulu",
      kennelpiiri: "PK",
      kennelpiirinro: "08",
      ylituomariNimi: "Matti Meikalainen",
    });

    const call = trialEventUpsertMock.mock.calls[0]?.[0];
    expect(call.update.ylituomariNimi).toBe("Matti Meikalainen");
  });
});
