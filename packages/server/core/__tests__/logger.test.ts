import { describe, expect, it } from "vitest";
import { toErrorLog } from "../logger";

describe("toErrorLog", () => {
  it("maps Error instances with stack", () => {
    const error = new Error("boom");

    const result = toErrorLog(error);

    expect(result.error.type).toBe("Error");
    expect(result.error.message).toBe("boom");
    expect(result.error.stack).toBeTypeOf("string");
  });

  it("maps object errors with message and explicit name", () => {
    const result = toErrorLog({ name: "CustomError", message: "failed" });

    expect(result).toEqual({
      error: {
        type: "CustomError",
        message: "failed",
      },
    });
  });

  it("maps object errors with message and fallback name", () => {
    const result = toErrorLog({ message: "failed" });

    expect(result).toEqual({
      error: {
        type: "UnknownObjectError",
        message: "failed",
      },
    });
  });

  it("maps object errors without message as non-error thrown values", () => {
    const result = toErrorLog({ code: "E_FAIL" });

    expect(result).toEqual({
      error: {
        type: "NonErrorThrownValue",
        message: "[object Object]",
      },
    });
  });

  it("maps primitive thrown values", () => {
    const result = toErrorLog("boom");

    expect(result).toEqual({
      error: {
        type: "NonErrorThrownValue",
        message: "boom",
      },
    });
  });
});
