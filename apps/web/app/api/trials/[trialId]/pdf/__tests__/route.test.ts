import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getTrialDogPdfDataServiceMock,
  infoMock,
  warnMock,
  errorMock,
  withLogContextMock,
} = vi.hoisted(() => ({
  getTrialDogPdfDataServiceMock: vi.fn(),
  infoMock: vi.fn(),
  warnMock: vi.fn(),
  errorMock: vi.fn(),
  withLogContextMock: vi.fn(),
}));

vi.mock("@server/trials/pdf/get-trial-dog-pdf-data", () => ({
  getTrialDogPdfDataService: getTrialDogPdfDataServiceMock,
}));

vi.mock("@server/core/logger", () => ({
  toErrorLog: (error: unknown) => ({
    errorMessage: error instanceof Error ? error.message : String(error),
  }),
  withLogContext: withLogContextMock,
}));

function request() {
  return new NextRequest("http://localhost/api/trials/entry-1/pdf", {
    headers: {
      origin: "http://localhost:3000",
      "x-request-id": "req-1",
    },
  });
}

describe("trial pdf api route", () => {
  beforeEach(() => {
    getTrialDogPdfDataServiceMock.mockReset();
    infoMock.mockReset();
    warnMock.mockReset();
    errorMock.mockReset();
    withLogContextMock.mockReset();
    withLogContextMock.mockReturnValue({
      info: infoMock,
      warn: warnMock,
      error: errorMock,
    });
  });

  it("returns a generated pdf from the trial row registration number", async () => {
    getTrialDogPdfDataServiceMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          trialId: "entry-1",
          registrationNo: "FI12345/21",
          dogSex: "MALE",
          sireName: "KIMNOBLE PONTE",
          sireRegistrationNo: "FI30688/14",
          damName: "ERÄSOINNUN TUKSU",
          damRegistrationNo: "FI21421/13",
          omistaja: "Marja ja Kari Virtanen",
          omistajanKotikunta: "Hyrynsalmi",
          ajotaitoEra1: 4,
          ajotaitoEra2: 2,
        },
      },
    });

    const { GET } = await import("../route");
    const response = await GET(request(), {
      params: Promise.resolve({ trialId: "entry-1" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(getTrialDogPdfDataServiceMock).toHaveBeenCalledWith("entry-1", {
      requestId: "req-1",
    });
    expect(
      Buffer.from(await response.arrayBuffer()).toString("latin1", 0, 4),
    ).toBe("%PDF");
  });

  it("passes data lookup errors through as json", async () => {
    getTrialDogPdfDataServiceMock.mockResolvedValue({
      status: 404,
      body: {
        ok: false,
        error: "Trial not found.",
        code: "TRIAL_NOT_FOUND",
      },
    });

    const { GET } = await import("../route");
    const response = await GET(request(), {
      params: Promise.resolve({ trialId: "entry-missing" }),
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: "Trial not found.",
      code: "TRIAL_NOT_FOUND",
    });
  });
});
