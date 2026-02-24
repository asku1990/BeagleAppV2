import { beforeEach, describe, expect, it, vi } from "vitest";
import { createActionLogger } from "../action-logger";

const { headersMock, withLogContextMock, randomUUIDMock } = vi.hoisted(() => ({
  headersMock: vi.fn(),
  withLogContextMock: vi.fn(),
  randomUUIDMock: vi.fn(() => "generated-request-id"),
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@beagle/server", () => ({
  withLogContext: withLogContextMock,
}));

describe("createActionLogger", () => {
  beforeEach(() => {
    headersMock.mockReset();
    withLogContextMock.mockReset();
    randomUUIDMock.mockClear();
    vi.stubGlobal("crypto", { randomUUID: randomUUIDMock });
    withLogContextMock.mockReturnValue({ info: vi.fn(), warn: vi.fn() });
  });

  it("uses trimmed x-request-id from headers", async () => {
    const requestHeaders = new Headers();
    requestHeaders.set("x-request-id", " req-123 ");
    headersMock.mockResolvedValue(requestHeaders);

    const result = await createActionLogger({ action: "searchDogsAction" });

    expect(result.requestId).toBe("req-123");
    expect(randomUUIDMock).not.toHaveBeenCalled();
    expect(withLogContextMock).toHaveBeenCalledWith({
      layer: "action",
      action: "searchDogsAction",
      requestId: "req-123",
    });
  });

  it("falls back to generated request id when header is missing", async () => {
    headersMock.mockResolvedValue(new Headers());

    const result = await createActionLogger({ action: "getNewestDogsAction" });

    expect(result.requestId).toBe("generated-request-id");
    expect(randomUUIDMock).toHaveBeenCalledOnce();
    expect(withLogContextMock).toHaveBeenCalledWith({
      layer: "action",
      action: "getNewestDogsAction",
      requestId: "generated-request-id",
    });
  });

  it("handles headers access errors and includes actor user id when provided", async () => {
    headersMock.mockRejectedValue(new Error("headers unavailable"));

    const result = await createActionLogger({
      action: "getHomeStatisticsAction",
      actorUserId: "user-1",
    });

    expect(result.requestId).toBe("generated-request-id");
    expect(withLogContextMock).toHaveBeenCalledWith({
      layer: "action",
      action: "getHomeStatisticsAction",
      requestId: "generated-request-id",
      actorUserId: "user-1",
    });
  });
});
