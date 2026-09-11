import { describe, expect, it } from "vitest";
import { formatTrialWeatherSummary } from "../weather";

const labels = {
  snow: "Lumikeli",
  bareGround: "Paljas maa",
  varied: "Vaihteleva",
};

describe("formatTrialWeatherSummary", () => {
  it("formats none, single, and varied summaries", () => {
    expect(formatTrialWeatherSummary({ kind: "none" }, labels)).toBe("-");
    expect(
      formatTrialWeatherSummary({ kind: "single", value: "L" }, labels),
    ).toBe("Lumikeli");
    expect(formatTrialWeatherSummary({ kind: "varied" }, labels)).toBe(
      "Vaihteleva",
    );
  });
});
