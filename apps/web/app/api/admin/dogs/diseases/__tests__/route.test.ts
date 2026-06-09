import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  listAdminDogDiseasesMock,
  getSessionCurrentUserMock,
  toAdminUserContextMock,
} = vi.hoisted(() => ({
  listAdminDogDiseasesMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  toAdminUserContextMock: vi.fn(),
}));

vi.mock("@beagle/server", () => ({
  listAdminDogDiseases: listAdminDogDiseasesMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@/lib/server/admin-user-context", () => ({
  toAdminUserContext: toAdminUserContextMock,
}));

describe("admin dog diseases api route", () => {
  beforeEach(() => {
    listAdminDogDiseasesMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    toAdminUserContextMock.mockReset();
  });

  it("returns CORS preflight responses", async () => {
    const { OPTIONS } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/admin/dogs/diseases",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );

    const response = await OPTIONS(request);

    expect(response.status).toBe(204);
  });

  it("returns disease rows for admins", async () => {
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    });
    toAdminUserContextMock.mockReturnValue({
      id: "u_1",
      email: "admin@example.com",
      username: "admin",
      role: "ADMIN",
    });
    listAdminDogDiseasesMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          selectedDiseaseCode: null,
          selectedDiseaseGroup: "EPILEPSIA",
          query: "kide",
          total: 1,
          totalPages: 1,
          page: 1,
          diseaseGroupOptions: [],
          diseaseOptions: [],
          items: [],
        },
      },
    });

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/admin/dogs/diseases?diseaseGroup=PURENTA&query=kide&page=2",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        selectedDiseaseCode: null,
        selectedDiseaseGroup: "EPILEPSIA",
        query: "kide",
        total: 1,
        totalPages: 1,
        page: 1,
        diseaseGroupOptions: [],
        diseaseOptions: [],
        items: [],
      },
    });
    expect(listAdminDogDiseasesMock).toHaveBeenCalledWith(
      {
        diseaseCode: undefined,
        diseaseGroup: "PURENTA",
        query: "kide",
        page: 2,
      },
      {
        id: "u_1",
        email: "admin@example.com",
        username: "admin",
        role: "ADMIN",
      },
    );
  });

  it("preserves diseaseCode filters in the api request", async () => {
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_3",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    });
    toAdminUserContextMock.mockReturnValue({
      id: "u_3",
      email: "admin@example.com",
      username: "admin",
      role: "ADMIN",
    });
    listAdminDogDiseasesMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          selectedDiseaseCode: "epi",
          selectedDiseaseGroup: "EPILEPSIA",
          query: "",
          total: 1,
          totalPages: 1,
          page: 1,
          diseaseGroupOptions: [],
          diseaseOptions: [],
          items: [],
        },
      },
    });

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/admin/dogs/diseases?diseaseCode=epi&page=1",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(listAdminDogDiseasesMock).toHaveBeenCalledWith(
      {
        diseaseCode: "epi",
        diseaseGroup: undefined,
        query: "",
        page: 1,
      },
      {
        id: "u_3",
        email: "admin@example.com",
        username: "admin",
        role: "ADMIN",
      },
    );
  });

  it("treats blank filters as undefined and returns structured errors", async () => {
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_2",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    });
    toAdminUserContextMock.mockReturnValue({
      id: "u_2",
      email: "admin@example.com",
      username: "admin",
      role: "ADMIN",
    });
    listAdminDogDiseasesMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          selectedDiseaseCode: null,
          selectedDiseaseGroup: "EPILEPSIA",
          query: "",
          total: 0,
          totalPages: 0,
          page: 1,
          diseaseGroupOptions: [],
          diseaseOptions: [],
          items: [],
        },
      },
    });

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/admin/dogs/diseases?diseaseCode=%20ALL%20&diseaseGroup=%20ALL%20&query=%20%20",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(listAdminDogDiseasesMock).toHaveBeenCalledWith(
      {
        diseaseCode: null,
        diseaseGroup: null,
        query: "",
        page: undefined,
      },
      {
        id: "u_2",
        email: "admin@example.com",
        username: "admin",
        role: "ADMIN",
      },
    );

    listAdminDogDiseasesMock.mockRejectedValue(new Error("boom"));

    const errorResponse = await GET(
      new NextRequest("http://localhost/api/admin/dogs/diseases", {
        headers: { origin: "http://localhost:3000" },
      }),
    );

    expect(errorResponse.status).toBe(500);
    await expect(errorResponse.json()).resolves.toEqual({
      ok: false,
      error: "Failed to load admin dog diseases.",
      code: "INTERNAL_ERROR",
    });
  });
});
