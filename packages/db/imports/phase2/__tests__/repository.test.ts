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

import {
  upsertTrialEntryByEventAndRegistrationDb,
  upsertTrialEventByLegacyKeyDb,
} from "../repository";

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

  it("does not clear an existing dog link when the lookup is missing", async () => {
    await upsertTrialEntryByEventAndRegistrationDb({
      trialEventId: "event-1",
      dogId: null,
      rekisterinumeroSnapshot: "FI-1/24",
      yksilointiAvain: "event-1|FI-1/24",
      raakadataJson: "{}",
      palkinto: null,
      sijoitus: null,
      loppupisteet: null,
      hakuKeskiarvo: null,
      haukkuKeskiarvo: null,
      yleisvaikutelmaPisteet: null,
      hakuloysyysTappioYhteensa: null,
      ajoloysyysTappioYhteensa: null,
      tieJaEstetyoskentelyPisteet: null,
      metsastysintoPisteet: null,
      keli: null,
      luopui: null,
      suljettu: null,
      keskeytetty: null,
      notes: null,
    });

    const call = prismaMock.trialEntry.upsert.mock.calls[0]?.[0];
    expect(call.update).not.toHaveProperty("dogId");
    expect(call.create).toMatchObject({
      yleisvaikutelmaPisteet: null,
      tieJaEstetyoskentelyPisteet: null,
      metsastysintoPisteet: null,
    });
  });
});
