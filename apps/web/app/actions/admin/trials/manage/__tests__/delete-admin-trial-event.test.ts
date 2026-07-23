import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAdminTrialEventAction } from "../delete-admin-trial-event";

const { guardMock, userMock, deleteMock } = vi.hoisted(() => ({
  guardMock: vi.fn(),
  userMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: guardMock,
}));
vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: userMock,
}));
vi.mock("@beagle/server", () => ({ deleteAdminTrialEvent: deleteMock }));

describe("deleteAdminTrialEventAction", () => {
  beforeEach(() => {
    guardMock.mockReset();
    userMock.mockReset();
    deleteMock.mockReset();
    guardMock.mockResolvedValue({ ok: true });
    userMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      role: "ADMIN",
    });
  });

  it("propagates the non-empty conflict", async () => {
    deleteMock.mockResolvedValue({
      status: 409,
      body: { ok: false, code: "TRIAL_EVENT_NOT_EMPTY", error: "Not empty" },
    });

    await expect(
      deleteAdminTrialEventAction({ trialEventId: "event-1" }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "TRIAL_EVENT_NOT_EMPTY",
      message: "Not empty",
    });
  });

  it("returns the deleted event id", async () => {
    deleteMock.mockResolvedValue({
      status: 200,
      body: { ok: true, data: { deletedTrialEventId: "event-1" } },
    });

    await expect(
      deleteAdminTrialEventAction({ trialEventId: "event-1" }),
    ).resolves.toEqual({
      data: { deletedTrialEventId: "event-1" },
      hasError: false,
    });
  });
});
