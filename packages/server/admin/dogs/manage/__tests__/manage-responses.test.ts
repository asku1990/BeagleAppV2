import { describe, expect, it } from "vitest";
import {
  colorCodeNotFoundResponse,
  hiddenColorCodeResponse,
  invalidColorCodeResponse,
  legacyUnknownColorCodeResponse,
} from "../internal/manage-responses";

describe("manage color responses", () => {
  it("returns the invalid color code error message", () => {
    expect(invalidColorCodeResponse()).toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Invalid color code.",
        code: "INVALID_COLOR_CODE",
      },
    });
  });

  it("returns the not found color code error message", () => {
    expect(colorCodeNotFoundResponse()).toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Color code was not found.",
        code: "COLOR_CODE_NOT_FOUND",
      },
    });
  });

  it("returns the hidden color code error message", () => {
    expect(hiddenColorCodeResponse()).toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Color code is hidden and cannot be selected.",
        code: "COLOR_CODE_HIDDEN",
      },
    });
  });

  it("returns the legacy unknown color code error message", () => {
    expect(legacyUnknownColorCodeResponse()).toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Color code is a legacy unknown value and cannot be selected.",
        code: "COLOR_CODE_LEGACY_UNKNOWN",
      },
    });
  });
});
