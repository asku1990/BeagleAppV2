import { describe, expect, it } from "vitest";
import { formatDogColor } from "../color";

describe("formatDogColor", () => {
  it("uses the requested language", () => {
    const color = {
      code: 121,
      nameFi: "Kolmivärinen",
      nameSv: "Trefärgad",
      nameEn: null,
      status: "SELECTABLE" as const,
    };

    expect(formatDogColor(color, "fi")).toBe("Kolmivärinen");
    expect(formatDogColor(color, "sv")).toBe("Trefärgad");
  });

  it("includes the source code for an unnamed legacy color", () => {
    expect(
      formatDogColor(
        {
          code: 391,
          nameFi: "Tuntematon väri",
          nameSv: "Okänd färg",
          nameEn: "Unknown color",
          status: "LEGACY_UNKNOWN",
        },
        "sv",
      ),
    ).toBe("Okänd färg (391)");
  });
});
