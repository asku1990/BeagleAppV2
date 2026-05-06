import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { logErrorMock, logInfoMock, logWarnMock, upsertMock } = vi.hoisted(
  () => ({
    logErrorMock: vi.fn(),
    logInfoMock: vi.fn(),
    logWarnMock: vi.fn(),
    upsertMock: vi.fn(),
  }),
);

vi.mock("@beagle/server", () => ({
  trialsService: {
    upsertKoiratietokantaAjokResult: upsertMock,
  },
  withLogContext: vi.fn(() => ({
    error: logErrorMock,
    info: logInfoMock,
    warn: logWarnMock,
  })),
}));

const ORIGINAL_SECRET = process.env.KOIRATIETOKANTA_RESULTS_API_SECRET;

describe("koiratietokanta AJOK upsert route", () => {
  beforeEach(() => {
    logErrorMock.mockReset();
    logInfoMock.mockReset();
    logWarnMock.mockReset();
    upsertMock.mockReset();
    process.env.KOIRATIETOKANTA_RESULTS_API_SECRET = "secret-1";
  });

  afterEach(() => {
    if (ORIGINAL_SECRET == null) {
      delete process.env.KOIRATIETOKANTA_RESULTS_API_SECRET;
    } else {
      process.env.KOIRATIETOKANTA_RESULTS_API_SECRET = ORIGINAL_SECRET;
    }
  });

  it("returns 401 when bearer secret is invalid", async () => {
    const { POST } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/integraatiot/koiratietokanta/koetulokset/upsert",
      {
        method: "POST",
        headers: { authorization: "Bearer wrong" },
        body: JSON.stringify({}),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(upsertMock).not.toHaveBeenCalled();
    expect(logWarnMock).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "unauthorized",
        code: "UNAUTHORIZED",
        hasAuthorizationHeader: true,
        hasBearerToken: true,
      }),
      "koiratietokanta AJOK upsert rejected by auth",
    );
  });

  it("returns 400 when JSON is invalid", async () => {
    const { POST } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/integraatiot/koiratietokanta/koetulokset/upsert",
      {
        method: "POST",
        headers: { authorization: "Bearer secret-1" },
        body: "{",
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
    expect(logWarnMock).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "invalid_json",
        code: "INVALID_JSON",
      }),
      "koiratietokanta AJOK upsert rejected because JSON is invalid",
    );
  });

  it("delegates valid authorized payloads to trials service", async () => {
    upsertMock.mockResolvedValueOnce({
      status: 201,
      body: {
        ok: true,
        data: {
          trialEventId: "event-1",
          trialEntryId: "entry-1",
          created: true,
          updated: false,
          warnings: [],
        },
      },
    });

    const payload = {
      SKLid: "431477",
      REKISTERINUMERO: "FI33413/18",
      Koepvm: "2025-09-07",
      KOEPAIKKA: "Ristijärvi",
    };
    const { POST } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/integraatiot/koiratietokanta/koetulokset/upsert",
      {
        method: "POST",
        headers: { authorization: "Bearer secret-1" },
        body: JSON.stringify(payload),
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(upsertMock).toHaveBeenCalledWith(payload);
    expect(logInfoMock).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "completed",
        status: 201,
      }),
      "koiratietokanta AJOK upsert route completed",
    );
  });

  it("logs service 500 responses as route errors", async () => {
    upsertMock.mockResolvedValueOnce({
      status: 500,
      body: {
        ok: false,
        code: "UNEXPECTED_ERROR",
        error: "Unexpected AJOK result upsert error.",
      },
    });

    const { POST } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/integraatiot/koiratietokanta/koetulokset/upsert",
      {
        method: "POST",
        headers: { authorization: "Bearer secret-1" },
        body: JSON.stringify({
          SKLid: "431477",
          REKISTERINUMERO: "FI33413/18",
          Koepvm: "2025-09-07",
          KOEPAIKKA: "Ristijärvi",
        }),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(logErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "rejected",
        status: 500,
        code: "UNEXPECTED_ERROR",
      }),
      "koiratietokanta AJOK upsert route failed",
    );
    expect(logInfoMock).not.toHaveBeenCalled();
  });
});
