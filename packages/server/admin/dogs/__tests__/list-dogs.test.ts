import { beforeEach, describe, expect, it, vi } from "vitest";
import { listAdminDogs } from "../list-dogs";

const { listAdminDogsDbMock } = vi.hoisted(() => ({
  listAdminDogsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  listAdminDogsDb: listAdminDogsDbMock,
}));

describe("listAdminDogs", () => {
  beforeEach(() => {
    listAdminDogsDbMock.mockReset();
  });

  it("returns unauthenticated when user is missing", async () => {
    await expect(listAdminDogs({}, null)).resolves.toEqual({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });

    expect(listAdminDogsDbMock).not.toHaveBeenCalled();
  });

  it("returns forbidden when user has non-admin role", async () => {
    await expect(
      listAdminDogs(
        {},
        {
          id: "u_1",
          email: "user@example.com",
          username: null,
          role: "USER",
        },
      ),
    ).resolves.toEqual({
      status: 403,
      body: {
        ok: false,
        error: "Admin role required.",
        code: "FORBIDDEN",
      },
    });

    expect(listAdminDogsDbMock).not.toHaveBeenCalled();
  });

  it("returns bad request for invalid filter values", async () => {
    const adminUser = {
      id: "u_1",
      email: "admin@example.com",
      username: null,
      role: "ADMIN" as const,
    };

    await expect(
      listAdminDogs({ sort: "unsupported" as "name-asc" }, adminUser),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Invalid sort value.",
        code: "INVALID_SORT",
      },
    });

    await expect(
      listAdminDogs({ sex: "INVALID" as "MALE" }, adminUser),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Invalid sex value.",
        code: "INVALID_SEX",
      },
    });
  });

  it("returns mapped dog rows when db succeeds", async () => {
    listAdminDogsDbMock.mockResolvedValue({
      total: 1,
      totalPages: 1,
      page: 1,
      items: [
        {
          id: "dog_1",
          registrationNo: "FI12345/21",
          name: "Metsapolun Kide",
          sex: "FEMALE",
          birthDate: new Date("2021-04-09T00:00:00.000Z"),
          breederName: "Metsapolun",
          ownerNames: ["Tiina Virtanen", "Antti Virtanen"],
          sire: {
            id: "dog_sire",
            name: "Korven Aatos",
            registrationNo: "FI54321/20",
          },
          dam: {
            id: "dog_dam",
            name: "Havupolun Helmi",
            registrationNo: "FI77777/18",
          },
          trialCount: 7,
          showCount: 4,
          ekNo: 5588,
          note: "Important",
        },
      ],
    });

    await expect(
      listAdminDogs(
        {
          query: "kide",
          sex: "FEMALE",
          page: 1,
          pageSize: 20,
          sort: "name-asc",
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
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
              ownerNames: ["Tiina Virtanen", "Antti Virtanen"],
              sire: {
                id: "dog_sire",
                name: "Korven Aatos",
                registrationNo: "FI54321/20",
              },
              dam: {
                id: "dog_dam",
                name: "Havupolun Helmi",
                registrationNo: "FI77777/18",
              },
              trialCount: 7,
              showCount: 4,
              ekNo: 5588,
              note: "Important",
            },
          ],
        },
      },
    });

    expect(listAdminDogsDbMock).toHaveBeenCalledWith({
      query: "kide",
      sex: "FEMALE",
      page: 1,
      pageSize: 20,
      sort: "name-asc",
    });
  });

  it("returns internal error when db throws", async () => {
    listAdminDogsDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      listAdminDogs(
        {},
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin dogs.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
