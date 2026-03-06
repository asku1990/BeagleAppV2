import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBeagleShowDetailsAction } from "../get-show-details";

const {
  createActionLoggerMock,
  getBeagleShowDetailsMock,
  infoLogMock,
  warnLogMock,
  errorLogMock,
} = vi.hoisted(() => ({
  createActionLoggerMock: vi.fn(),
  getBeagleShowDetailsMock: vi.fn(),
  infoLogMock: vi.fn(),
  warnLogMock: vi.fn(),
  errorLogMock: vi.fn(),
}));

vi.mock("@/lib/server/action-logger", () => ({
  createActionLogger: createActionLoggerMock,
}));

vi.mock("@beagle/server", () => ({
  showsService: {
    getBeagleShowDetails: getBeagleShowDetailsMock,
  },
  toErrorLog: (error: unknown) => ({ error }),
}));

describe("getBeagleShowDetailsAction", () => {
  beforeEach(() => {
    createActionLoggerMock.mockReset();
    getBeagleShowDetailsMock.mockReset();
    infoLogMock.mockReset();
    warnLogMock.mockReset();
    errorLogMock.mockReset();

    createActionLoggerMock.mockResolvedValue({
      log: {
        info: infoLogMock,
        warn: warnLogMock,
        error: errorLogMock,
      },
      requestId: "req_1",
    });
  });

  it("returns 400 for empty show id and skips service", async () => {
    await expect(getBeagleShowDetailsAction("   ")).resolves.toEqual({
      data: null,
      hasError: true,
      status: 400,
      error: "Invalid show id.",
    });

    expect(getBeagleShowDetailsMock).not.toHaveBeenCalled();
    expect(warnLogMock).toHaveBeenCalled();
  });

  it("returns details on success", async () => {
    getBeagleShowDetailsMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          show: {
            showId: "s_1",
            eventDate: "2025-06-01",
            eventPlace: "Helsinki",
            judge: "Judge Main",
            dogCount: 1,
          },
          items: [
            {
              id: "r_1",
              dogId: "d_1",
              registrationNo: "FI-1/20",
              name: "Aatu",
              sex: "U",
              result: "ERI",
              heightCm: 40,
              judge: "Judge Main",
            },
          ],
        },
      },
    });

    await expect(getBeagleShowDetailsAction(" s_1 ")).resolves.toEqual({
      data: {
        show: {
          showId: "s_1",
          eventDate: "2025-06-01",
          eventPlace: "Helsinki",
          judge: "Judge Main",
          dogCount: 1,
        },
        items: [
          {
            id: "r_1",
            dogId: "d_1",
            registrationNo: "FI-1/20",
            name: "Aatu",
            sex: "U",
            result: "ERI",
            heightCm: 40,
            judge: "Judge Main",
          },
        ],
      },
      hasError: false,
      status: 200,
    });

    expect(getBeagleShowDetailsMock).toHaveBeenCalledWith("s_1", {
      requestId: "req_1",
    });
  });

  it("returns mapped status and error on failure", async () => {
    getBeagleShowDetailsMock.mockResolvedValue({
      status: 404,
      body: {
        ok: false,
        error: "Show not found.",
      },
    });

    await expect(getBeagleShowDetailsAction("s_missing")).resolves.toEqual({
      data: null,
      hasError: true,
      status: 404,
      error: "Show not found.",
    });
  });

  it("returns 500 payload when service throws", async () => {
    getBeagleShowDetailsMock.mockRejectedValue(new Error("boom"));

    await expect(getBeagleShowDetailsAction("s_1")).resolves.toEqual({
      data: null,
      hasError: true,
      status: 500,
      error: "Failed to load show details.",
    });

    expect(errorLogMock).toHaveBeenCalled();
  });
});
