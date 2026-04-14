import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAdminTrialMock, getSessionCurrentUserMock } = vi.hoisted(() => ({
  getAdminTrialMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
}));

vi.mock("@beagle/server", () => ({
  getAdminTrial: getAdminTrialMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@/lib/server/admin-user-context", () => ({
  toAdminUserContext: (
    currentUser: {
      id: string;
      email: string;
      name: string | null;
      role: "ADMIN" | "USER";
    } | null,
  ) =>
    currentUser
      ? {
          id: currentUser.id,
          email: currentUser.email,
          username: currentUser.name,
          role: currentUser.role,
        }
      : null,
}));

vi.mock("@/lib/server/cors", () => ({
  jsonResponse: (body: unknown, init: { status?: number } = {}) =>
    new Response(JSON.stringify(body), {
      status: init.status ?? 200,
      headers: { "Content-Type": "application/json" },
    }),
  optionsResponse: () => new Response(null, { status: 204 }),
}));

describe("admin trial detail api route", () => {
  beforeEach(() => {
    getAdminTrialMock.mockReset();
    getSessionCurrentUserMock.mockReset();
  });

  it("returns admin trial detail from service", async () => {
    getSessionCurrentUserMock.mockResolvedValue({
      id: "a1",
      email: "admin@example.com",
      name: "admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: null,
    });
    getAdminTrialMock.mockResolvedValue({
      status: 200,
      body: { ok: true, data: { trial: { trialId: "trial-1" } } },
    });

    const { GET } = await import("../[trialId]/route");
    const request = new NextRequest(
      "http://localhost/api/admin/trials/trial-1",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request, {
      params: Promise.resolve({ trialId: "trial-1" }),
    });

    expect(response.status).toBe(200);
    expect(getAdminTrialMock).toHaveBeenCalledWith(
      { trialId: "trial-1" },
      {
        id: "a1",
        email: "admin@example.com",
        username: "admin",
        role: "ADMIN",
      },
    );
  });

  it("returns structured errors when service throws", async () => {
    getSessionCurrentUserMock.mockResolvedValue({
      id: "a1",
      email: "admin@example.com",
      name: "admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: null,
    });
    getAdminTrialMock.mockRejectedValue(new Error("boom"));

    const { GET } = await import("../[trialId]/route");
    const request = new NextRequest(
      "http://localhost/api/admin/trials/trial-1",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request, {
      params: Promise.resolve({ trialId: "trial-1" }),
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Failed to load admin trial details.",
      code: "INTERNAL_ERROR",
    });
  });
});
