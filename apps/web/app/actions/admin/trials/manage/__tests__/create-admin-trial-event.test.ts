import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminTrialEventAction } from "../create-admin-trial-event";

const { guardMock, userMock, createMock } = vi.hoisted(() => ({
  guardMock: vi.fn(),
  userMock: vi.fn(),
  createMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: guardMock,
}));
vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: userMock,
}));
vi.mock("@beagle/server", () => ({ createAdminTrialEvent: createMock }));

const input = {
  eventDate: "2026-07-21",
  eventPlace: "Helsinki",
  jarjestaja: null,
  ylituomari: null,
  ylituomariNumero: null,
  ytKertomus: null,
  kennelpiiri: null,
  kennelpiirinro: null,
  sklKoeId: 123,
};

describe("createAdminTrialEventAction", () => {
  beforeEach(() => {
    guardMock.mockReset();
    userMock.mockReset();
    createMock.mockReset();
  });

  it("rejects missing admin access", async () => {
    guardMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(createAdminTrialEventAction(input)).resolves.toMatchObject({
      hasError: true,
      errorCode: "FORBIDDEN",
    });
    expect(createMock).not.toHaveBeenCalled();
  });

  it("propagates service errors", async () => {
    guardMock.mockResolvedValue({ ok: true });
    userMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      role: "ADMIN",
    });
    createMock.mockResolvedValue({
      status: 409,
      body: { ok: false, code: "SKL_KOE_ID_CONFLICT", error: "Conflict" },
    });

    await expect(createAdminTrialEventAction(input)).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "SKL_KOE_ID_CONFLICT",
      message: "Conflict",
    });
  });

  it("returns navigation data", async () => {
    guardMock.mockResolvedValue({ ok: true });
    userMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      role: "ADMIN",
    });
    createMock.mockResolvedValue({
      status: 201,
      body: { ok: true, data: { trialEventId: "event-1" } },
    });

    await expect(createAdminTrialEventAction(input)).resolves.toEqual({
      data: { trialEventId: "event-1" },
      hasError: false,
    });
  });
});
