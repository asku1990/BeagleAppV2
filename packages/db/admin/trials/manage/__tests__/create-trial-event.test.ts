import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminTrialEventWriteDb } from "../create-trial-event";

const { trialEventCreateMock } = vi.hoisted(() => ({
  trialEventCreateMock: vi.fn(),
}));

vi.mock("@db/core/prisma", () => ({
  prisma: { trialEvent: { create: trialEventCreateMock } },
}));

describe("createAdminTrialEventWriteDb", () => {
  beforeEach(() => {
    trialEventCreateMock.mockReset();
  });

  it("creates one empty event with the resolved rule window", async () => {
    trialEventCreateMock.mockResolvedValue({ id: "event-1" });
    const eventDate = new Date("2026-07-21T00:00:00.000Z");

    await expect(
      createAdminTrialEventWriteDb({
        eventDate,
        eventPlace: "Helsinki",
        jarjestaja: "Club",
        ylituomari: null,
        ylituomariNumero: null,
        ytKertomus: null,
        kennelpiiri: null,
        kennelpiirinro: null,
        sklKoeId: 123,
        trialRuleWindowId: "window-1",
      }),
    ).resolves.toEqual({ trialEventId: "event-1" });

    expect(trialEventCreateMock).toHaveBeenCalledWith({
      data: expect.objectContaining({
        koepaiva: eventDate,
        koekunta: "Helsinki",
        sklKoeId: 123,
        trialRuleWindowId: "window-1",
      }),
      select: { id: true },
    });
  });

  it("propagates duplicate SKL id errors for the service to map", async () => {
    const duplicateError = Object.assign(new Error("duplicate SKL id"), {
      code: "P2002",
    });
    trialEventCreateMock.mockRejectedValue(duplicateError);

    await expect(
      createAdminTrialEventWriteDb({
        eventDate: new Date("2026-07-21T00:00:00.000Z"),
        eventPlace: "Helsinki",
        jarjestaja: null,
        ylituomari: null,
        ylituomariNumero: null,
        ytKertomus: null,
        kennelpiiri: null,
        kennelpiirinro: null,
        sklKoeId: 123,
        trialRuleWindowId: null,
      }),
    ).rejects.toBe(duplicateError);
  });
});
