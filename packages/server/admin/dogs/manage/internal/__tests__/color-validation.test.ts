import { describe, expect, it } from "vitest";
import { validateAdminDogColorSelection } from "../color-validation";

describe("validateAdminDogColorSelection", () => {
  it("returns a not found failure when the catalog entry is missing", () => {
    expect(validateAdminDogColorSelection(999, null)).toEqual({
      ok: false,
      logContext: {
        event: "color_code_not_found",
        colorCode: 999,
      },
      logMessage:
        "admin dog color validation rejected because color code was not found",
      response: {
        status: 400,
        body: {
          ok: false,
          error: "Color code was not found.",
          code: "COLOR_CODE_NOT_FOUND",
        },
      },
    });
  });

  it("returns a hidden failure when the catalog entry is hidden", () => {
    expect(validateAdminDogColorSelection(112, { status: "HIDDEN" })).toEqual({
      ok: false,
      logContext: {
        event: "color_code_hidden",
        colorCode: 112,
      },
      logMessage:
        "admin dog color validation rejected because color code is hidden",
      response: {
        status: 400,
        body: {
          ok: false,
          error: "Color code is hidden and cannot be selected.",
          code: "COLOR_CODE_HIDDEN",
        },
      },
    });
  });

  it("returns a legacy unknown failure when the catalog entry is legacy unknown", () => {
    expect(
      validateAdminDogColorSelection(493, { status: "LEGACY_UNKNOWN" }),
    ).toEqual({
      ok: false,
      logContext: {
        event: "color_code_legacy_unknown",
        colorCode: 493,
      },
      logMessage:
        "admin dog color validation rejected because color code is a legacy unknown value",
      response: {
        status: 400,
        body: {
          ok: false,
          error: "Color code is a legacy unknown value and cannot be selected.",
          code: "COLOR_CODE_LEGACY_UNKNOWN",
        },
      },
    });
  });

  it("allows an existing hidden color to be retained", () => {
    expect(
      validateAdminDogColorSelection(112, { status: "HIDDEN" }, 112),
    ).toEqual({
      ok: true,
    });
  });

  it("allows an existing legacy unknown color to be retained", () => {
    expect(
      validateAdminDogColorSelection(493, { status: "LEGACY_UNKNOWN" }, 493),
    ).toEqual({
      ok: true,
    });
  });
});
