import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminTrialEntryAction } from "../create-admin-trial-entry";

const { guard, user, create } = vi.hoisted(() => ({
  guard: vi.fn(),
  user: vi.fn(),
  create: vi.fn(),
}));
vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: guard,
}));
vi.mock("@/lib/server/current-user", () => ({ getSessionCurrentUser: user }));
vi.mock("@beagle/server", () => ({ createAdminTrialEntry: create }));

const input = {
  trialEventId: "event-1",
  registrationNo: "FI1/20",
  entry: {} as never,
  eras: [],
  lisatiedotRows: [],
};

describe("createAdminTrialEntryAction", () => {
  beforeEach(() => {
    guard.mockReset();
    user.mockReset();
    create.mockReset();
  });

  it("rejects missing admin access", async () => {
    guard.mockResolvedValue({ ok: false, status: 403 });
    await expect(createAdminTrialEntryAction(input)).resolves.toMatchObject({
      hasError: true,
      errorCode: "FORBIDDEN",
    });
  });

  it("passes through stable service errors", async () => {
    guard.mockResolvedValue({ ok: true });
    user.mockResolvedValue({ id: "u1", email: "a@example.com", role: "ADMIN" });
    create.mockResolvedValue({
      status: 409,
      body: {
        ok: false,
        code: "TRIAL_ENTRY_REGISTRATION_CONFLICT",
        error: "Conflict",
      },
    });
    await expect(createAdminTrialEntryAction(input)).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "TRIAL_ENTRY_REGISTRATION_CONFLICT",
      message: "Conflict",
    });
  });
});
