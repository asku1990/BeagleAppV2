import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculateAdminDogInbreedingAction } from "../calculate-admin-dog-inbreeding";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  calculateAdminDogInbreedingMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  calculateAdminDogInbreedingMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  calculateAdminDogInbreeding: calculateAdminDogInbreedingMock,
}));

describe("calculateAdminDogInbreedingAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    calculateAdminDogInbreedingMock.mockReset();
  });

  it("returns unauthenticated when admin access is missing because of auth", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 401 });

    await expect(
      calculateAdminDogInbreedingAction({
        sireRegistrationNo: "FI54321/20",
        damRegistrationNo: "FI77777/18",
      }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "UNAUTHENTICATED",
      message: "Admin access required.",
    });
  });

  it("returns unauthenticated when current user is missing", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue(null);

    await expect(
      calculateAdminDogInbreedingAction({
        sireRegistrationNo: "FI54321/20",
        damRegistrationNo: "FI77777/18",
      }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "UNAUTHENTICATED",
      message: "Admin access required.",
    });
  });

  it("returns mapped service error", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    });
    calculateAdminDogInbreedingMock.mockResolvedValue({
      status: 400,
      body: {
        ok: false,
        error: "Sire registration number was not found.",
        code: "INVALID_SIRE_REGISTRATION",
      },
    });

    await expect(
      calculateAdminDogInbreedingAction({
        sireRegistrationNo: "FI54321/20",
        damRegistrationNo: "FI77777/18",
      }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "INVALID_SIRE_REGISTRATION",
      message: "Sire registration number was not found.",
    });
  });

  it("returns calculated inbreeding coefficient when service succeeds", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    });
    calculateAdminDogInbreedingMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          inbreedingCoefficientPct: 12.5,
        },
      },
    });

    const input = {
      sireRegistrationNo: "FI54321/20",
      damRegistrationNo: "FI77777/18",
    };

    await expect(calculateAdminDogInbreedingAction(input)).resolves.toEqual({
      data: {
        inbreedingCoefficientPct: 12.5,
      },
      hasError: false,
    });

    expect(calculateAdminDogInbreedingMock).toHaveBeenCalledWith(input, {
      id: "u_1",
      email: "admin@example.com",
      username: "Admin",
      role: "ADMIN",
    });
  });
});
