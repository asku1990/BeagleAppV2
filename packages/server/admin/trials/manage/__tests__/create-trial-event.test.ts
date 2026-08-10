import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminTrialEvent } from "../create-trial-event";

const { createWriteMock, listActiveRuleWindowsMock } = vi.hoisted(() => ({
  createWriteMock: vi.fn(),
  listActiveRuleWindowsMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  createAdminTrialEventWriteDb: createWriteMock,
  listActiveTrialRuleWindowsDb: listActiveRuleWindowsMock,
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

describe("createAdminTrialEvent", () => {
  beforeEach(() => {
    createWriteMock.mockReset();
    listActiveRuleWindowsMock.mockReset();
    listActiveRuleWindowsMock.mockResolvedValue([
      { id: "window-1", fromYmd: 20200101, toYmd: null },
    ]);
    createWriteMock.mockResolvedValue({ trialEventId: "event-1" });
  });

  it("requires admin authorization", async () => {
    const result = await createAdminTrialEvent(validInput, {
      ...admin,
      role: "USER",
    });

    expect(result.status).toBe(403);
    expect(createWriteMock).not.toHaveBeenCalled();
  });

  it.each([
    ["event date", { eventDate: "2026-02-30" }, "INVALID_EVENT_DATE"],
    ["event place", { eventPlace: " " }, "INVALID_EVENT_PLACE"],
    ["SKL id", { sklKoeId: 0 }, "INVALID_SKL_KOE_ID"],
  ])("rejects an invalid %s", async (_label, override, code) => {
    const result = await createAdminTrialEvent(
      { ...validInput, ...override },
      admin,
    );

    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({ ok: false, code });
    expect(createWriteMock).not.toHaveBeenCalled();
  });

  it("normalizes metadata and assigns the active rule window", async () => {
    const result = await createAdminTrialEvent(validInput, admin);

    expect(result).toEqual({
      status: 201,
      body: { ok: true, data: { trialEventId: "event-1" } },
    });
    expect(listActiveRuleWindowsMock).toHaveBeenCalledOnce();
    expect(createWriteMock).toHaveBeenCalledWith(
      expect.objectContaining({
        eventDate: new Date("2026-07-21T00:00:00.000Z"),
        eventPlace: "Helsinki",
        jarjestaja: "Club",
        sklKoeId: 123,
        trialRuleWindowId: "window-1",
      }),
    );
  });

  it("allows no matching active rule window", async () => {
    listActiveRuleWindowsMock.mockResolvedValue([]);

    await createAdminTrialEvent(validInput, admin);

    expect(createWriteMock).toHaveBeenCalledWith(
      expect.objectContaining({ trialRuleWindowId: null }),
    );
  });

  it("maps duplicate SKL ids to a stable conflict", async () => {
    createWriteMock.mockRejectedValue({ code: "P2002" });

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
