import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminDogsAction } from "../get-admin-dogs";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  listAdminDogsMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  listAdminDogsMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  listAdminDogs: listAdminDogsMock,
}));

describe("getAdminDogsAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    listAdminDogsMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({
      ok: false,
      status: 403,
    });

    await expect(getAdminDogsAction({})).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "FORBIDDEN",
    });
  });

  it("returns unauthenticated when no session user exists", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue(null);

    await expect(getAdminDogsAction({})).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "UNAUTHENTICATED",
    });

    expect(listAdminDogsMock).not.toHaveBeenCalled();
  });

  it("returns service error code when listing fails", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: "s_1",
    });
    listAdminDogsMock.mockResolvedValue({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin dogs.",
        code: "INTERNAL_ERROR",
      },
    });

    await expect(getAdminDogsAction({})).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "INTERNAL_ERROR",
    });
  });

  it("returns dogs when service succeeds", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: "s_1",
    });
    listAdminDogsMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          total: 1,
          totalPages: 1,
          page: 1,
          items: [
            {
              id: "dog_1",
              registrationNo: "FI12345/21",
              name: "Metsapolun Kide",
              sex: "FEMALE",
              birthDate: "2021-04-09T00:00:00.000Z",
              breederName: "Metsapolun",
              ownerNames: ["Tiina Virtanen"],
              sire: null,
              dam: null,
              trialCount: 7,
              showCount: 4,
              ekNo: 5588,
              note: null,
            },
          ],
        },
      },
    });

    await expect(getAdminDogsAction({ query: "kide" })).resolves.toEqual({
      data: {
        total: 1,
        totalPages: 1,
        page: 1,
        items: [
          {
            id: "dog_1",
            registrationNo: "FI12345/21",
            name: "Metsapolun Kide",
            sex: "FEMALE",
            birthDate: "2021-04-09T00:00:00.000Z",
            breederName: "Metsapolun",
            ownerNames: ["Tiina Virtanen"],
            sire: null,
            dam: null,
            trialCount: 7,
            showCount: 4,
            ekNo: 5588,
            note: null,
          },
        ],
      },
      hasError: false,
    });

    expect(listAdminDogsMock).toHaveBeenCalledWith(
      { query: "kide" },
      {
        id: "u_1",
        email: "admin@example.com",
        username: "Admin",
        role: "ADMIN",
      },
    );
  });
});
