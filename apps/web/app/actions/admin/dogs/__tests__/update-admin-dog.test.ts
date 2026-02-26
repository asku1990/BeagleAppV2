import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateAdminDogAction } from "../update-admin-dog";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  updateAdminDogMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  updateAdminDogMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  updateAdminDog: updateAdminDogMock,
}));

describe("updateAdminDogAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    updateAdminDogMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(
      updateAdminDogAction({
        id: "dog_1",
        name: "Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
      }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "FORBIDDEN",
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
      createdAt: null,
      sessionId: "s_1",
    });
    updateAdminDogMock.mockResolvedValue({
      status: 404,
      body: {
        ok: false,
        error: "Dog not found.",
        code: "DOG_NOT_FOUND",
      },
    });

    await expect(
      updateAdminDogAction({
        id: "dog_1",
        name: "Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
      }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "DOG_NOT_FOUND",
      message: "Dog not found.",
    });
  });

  it("returns updated dog data when service succeeds", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: "s_1",
    });
    updateAdminDogMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          id: "dog_1",
          name: "Kide",
          sex: "FEMALE",
          registrationNo: "FI12345/21",
        },
      },
    });

    await expect(
      updateAdminDogAction({
        id: "dog_1",
        name: "Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
      }),
    ).resolves.toEqual({
      data: {
        id: "dog_1",
        name: "Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
      },
      hasError: false,
    });
  });

  it("forwards full update payload unchanged to service", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: "s_1",
    });
    updateAdminDogMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          id: "dog_1",
          name: "Metsapolun Kide",
          sex: "FEMALE",
          registrationNo: "FI12345/21",
        },
      },
    });

    const payload = {
      id: "dog_1",
      name: "Metsapolun Kide",
      sex: "FEMALE" as const,
      birthDate: "2021-04-09",
      breederNameText: "Metsapolun",
      ownerNames: ["Tiina Virtanen", "Antti Virtanen"],
      ekNo: 5588,
      note: "Important note",
      registrationNo: "FI12345/21",
      secondaryRegistrationNos: ["FI54321/21"],
      sireRegistrationNo: "FI54321/20",
      damRegistrationNo: "FI77777/18",
    };

    await updateAdminDogAction(payload);

    expect(updateAdminDogMock).toHaveBeenCalledWith(payload, {
      actorUserId: "u_1",
      actorSessionId: "s_1",
      source: "WEB",
    });
  });
});
