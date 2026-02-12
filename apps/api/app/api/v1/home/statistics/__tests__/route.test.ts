import { beforeEach, describe, expect, it, vi } from "vitest";

const getHomeStatisticsMock = vi.fn();

vi.mock("@beagle/server", () => ({
  statsService: {
    getHomeStatistics: getHomeStatisticsMock,
  },
}));

describe("GET /api/v1/home/statistics", () => {
  beforeEach(() => {
    getHomeStatisticsMock.mockReset();
  });

  it("returns service payload and status", async () => {
    getHomeStatisticsMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          registrations: {
            registeredDogs: 1,
            youngestRegisteredBirthDate: null,
          },
          trials: {
            resultsPeriodStart: null,
            resultsPeriodEnd: null,
            totalEntries: 2,
            performedByDogs: 2,
          },
          shows: {
            resultsPeriodStart: null,
            resultsPeriodEnd: null,
            totalEntries: 3,
            performedByDogs: 3,
          },
          generatedAt: "2026-02-12T00:00:00.000Z",
        },
      },
    });

    const { GET } = await import("../route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        registrations: {
          registeredDogs: 1,
          youngestRegisteredBirthDate: null,
        },
        trials: {
          resultsPeriodStart: null,
          resultsPeriodEnd: null,
          totalEntries: 2,
          performedByDogs: 2,
        },
        shows: {
          resultsPeriodStart: null,
          resultsPeriodEnd: null,
          totalEntries: 3,
          performedByDogs: 3,
        },
        generatedAt: "2026-02-12T00:00:00.000Z",
      },
    });
    expect(response.headers.get("access-control-allow-methods")).toBe(
      "GET,OPTIONS",
    );
  });

  it("passes through service failure responses", async () => {
    getHomeStatisticsMock.mockResolvedValue({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load statistics.",
      },
    });

    const { GET } = await import("../route");
    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Failed to load statistics.",
    });
  });

  it("returns preflight options response", async () => {
    const { OPTIONS } = await import("../route");
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-methods")).toBe(
      "GET,OPTIONS",
    );
  });
});
