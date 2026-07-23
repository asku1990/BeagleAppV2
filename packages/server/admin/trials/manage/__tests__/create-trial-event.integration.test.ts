import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminTrialEvent } from "../create-trial-event";

const { ruleWindowFindManyMock, trialEventCreateMock } = vi.hoisted(() => ({
  ruleWindowFindManyMock: vi.fn(),
  trialEventCreateMock: vi.fn(),
}));

vi.mock("@db/core/prisma", () => ({
  prisma: {
    trialRuleWindow: { findMany: ruleWindowFindManyMock },
    trialEvent: { create: trialEventCreateMock },
  },
}));

const admin = {
  id: "u_1",
  email: "admin@example.com",
  username: null,
  role: "ADMIN" as const,
};

const validInput = {
  eventDate: "2026-07-21",
  eventPlace: " Helsinki ",
  jarjestaja: " Club ",
  ylituomari: null,
  ylituomariNumero: null,
  ytKertomus: null,
  kennelpiiri: null,
  kennelpiirinro: null,
  sklKoeId: 123,
};

describe("createAdminTrialEvent with the DB repository", () => {
  beforeEach(() => {
    ruleWindowFindManyMock.mockReset();
    trialEventCreateMock.mockReset();
    ruleWindowFindManyMock.mockResolvedValue([
      { id: "window-old", fromYmd: 20200101, toYmd: 20251231 },
      { id: "window-current", fromYmd: 20260101, toYmd: null },
    ]);
    trialEventCreateMock.mockResolvedValue({ id: "event-1" });
  });

  it("resolves the rule window and persists one empty event", async () => {
    await expect(createAdminTrialEvent(validInput, admin)).resolves.toEqual({
      status: 201,
      body: { ok: true, data: { trialEventId: "event-1" } },
    });

    expect(ruleWindowFindManyMock).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: {
        id: true,
        fromYmd: true,
        toYmd: true,
      },
    });
    expect(trialEventCreateMock).toHaveBeenCalledWith({
      data: {
        koepaiva: new Date("2026-07-21T00:00:00.000Z"),
        koekunta: "Helsinki",
        jarjestaja: "Club",
        ylituomariNimi: null,
        ylituomariNumero: null,
        ytKertomus: null,
        kennelpiiri: null,
        kennelpiirinro: null,
        sklKoeId: 123,
        trialRuleWindowId: "window-current",
      },
      select: { id: true },
    });
  });

  it("maps a repository duplicate error to the stable conflict", async () => {
    trialEventCreateMock.mockRejectedValue(
      Object.assign(new Error("duplicate SKL id"), { code: "P2002" }),
    );

    await expect(createAdminTrialEvent(validInput, admin)).resolves.toEqual({
      status: 409,
      body: {
        ok: false,
        error: "An event already uses this SKL koe id.",
        code: "SKL_KOE_ID_CONFLICT",
      },
    });
  });
});
