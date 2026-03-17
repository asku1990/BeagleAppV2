import { describe, expect, it } from "vitest";
import { parseShowResultText } from "../internal/show-result-parser";

describe("parseShowResultText", () => {
  it("parses class-quality from spaced format (KÄY H)", () => {
    const parsed = parseShowResultText("KÄY H", "2023-04-22");

    expect(parsed.className).toBe("KÄY");
    expect(parsed.qualityGrade).toBe("H");
    expect(parsed.placement).toBeNull();
    expect(parsed.unmappedTokens).toEqual([]);
    expect(parsed.items.some((item) => item.definitionCode === "H")).toBe(true);
  });

  it("parses class-quality-placement from KÄY-EH,KÄK1 and creates SIJOITUS", () => {
    const parsed = parseShowResultText("KÄY-EH,KÄK1", "2023-04-22");

    expect(parsed.className).toBe("KÄY");
    expect(parsed.qualityGrade).toBe("EH");
    expect(parsed.placement).toBe("1");
    expect(
      parsed.items.some(
        (item) =>
          item.definitionCode === "SIJOITUS" &&
          item.valueNumeric === 1 &&
          item.isAwarded === null,
      ),
    ).toBe(true);
  });

  it("parses class-quality-placement from AVO-ERI,AVK1", () => {
    const parsed = parseShowResultText("AVO-ERI,AVK1", "2023-04-22");

    expect(parsed.className).toBe("AVO");
    expect(parsed.qualityGrade).toBe("ERI");
    expect(parsed.placement).toBe("1");
    expect(parsed.unmappedTokens).toEqual([]);
  });

  it("parses class-quality-placement from JUN-EH,JUK1", () => {
    const parsed = parseShowResultText("JUN-EH,JUK1", "2023-04-22");

    expect(parsed.className).toBe("JUN");
    expect(parsed.qualityGrade).toBe("EH");
    expect(parsed.placement).toBe("1");
    expect(parsed.unmappedTokens).toEqual([]);
    const qualityCodes = parsed.items
      .filter((item) =>
        ["ERI", "EH", "H", "T", "EVA", "HYL"].includes(item.definitionCode),
      )
      .map((item) => item.definitionCode);
    expect(qualityCodes).toContain("EH");
    expect(qualityCodes).not.toContain("ERI");
  });

  it("parses NUO-EH,NUK1 without creating fallback ERI", () => {
    const parsed = parseShowResultText("NUO-EH,NUK1", "2023-04-22");

    expect(parsed.className).toBe("NUO");
    expect(parsed.qualityGrade).toBe("EH");
    expect(parsed.placement).toBe("1");
    expect(parsed.unmappedTokens).toEqual([]);
    const qualityCodes = parsed.items
      .filter((item) =>
        ["ERI", "EH", "H", "T", "EVA", "HYL"].includes(item.definitionCode),
      )
      .map((item) => item.definitionCode);
    expect(qualityCodes).toContain("EH");
    expect(qualityCodes).not.toContain("ERI");
  });

  it("treats VAK1 and VAKL1 as class placement only", () => {
    const vak = parseShowResultText("VAK1", "2023-04-22");
    const vakl = parseShowResultText("VAKL1", "2023-04-22");

    expect(vak.className).toBe("VAL");
    expect(vak.placement).toBe("1");
    expect(vak.qualityGrade).toBeNull();
    expect(vak.items.some((item) => item.definitionCode === "ERI")).toBe(false);

    expect(vakl.className).toBe("VAL");
    expect(vakl.placement).toBe("1");
    expect(vakl.qualityGrade).toBeNull();
    expect(vakl.items.some((item) => item.definitionCode === "ERI")).toBe(
      false,
    );
  });

  it("keeps pre-2003 class+digit as legacy numeric quality and converts from 2003 onward", () => {
    const preGate = parseShowResultText("NUO1", "2002-12-31");
    const postGate = parseShowResultText("NUO1", "2003-01-01");

    expect(preGate.className).toBe("NUO");
    expect(preGate.qualityGrade).toBeNull();
    expect(
      preGate.items.some(
        (item) =>
          item.definitionCode === "LAATU_NUMERO" && item.valueNumeric === 1,
      ),
    ).toBe(true);
    expect(preGate.items.some((item) => item.definitionCode === "ERI")).toBe(
      false,
    );
    expect(preGate.unmappedTokens).toEqual([]);
    expect(postGate.qualityGrade).toBe("ERI");
    expect(postGate.items.some((item) => item.definitionCode === "ERI")).toBe(
      true,
    );
  });

  it("parses class placement starting from zero (AVO0)", () => {
    const parsed = parseShowResultText("AVO0", "2023-04-22");

    expect(parsed.className).toBe("AVO");
    expect(parsed.placement).toBe("0");
    expect(parsed.qualityGrade).toBeNull();
    expect(parsed.unmappedTokens).toEqual([]);
    expect(
      parsed.items.some(
        (item) =>
          item.definitionCode === "SIJOITUS" &&
          item.valueNumeric === 0 &&
          item.isAwarded === null,
      ),
    ).toBe(true);
  });

  it("maps aliases to canonical definitions and dedupes duplicates", () => {
    const parsed = parseShowResultText(
      "VACACIB VACA V-CACIB CACIB-V CACIB-J",
      "2023-04-22",
    );

    const defCodes = new Set(parsed.items.map((item) => item.definitionCode));
    expect(defCodes.has("VARACACIB")).toBe(true);
    expect(defCodes.has("CACIB_V")).toBe(true);
    expect(defCodes.has("CACIB_J")).toBe(true);
    expect(parsed.unmappedTokens).toEqual([]);
  });

  it("keeps CACIB-V separate from reserve CACIB", () => {
    const parsed = parseShowResultText("CACIB-V VACACIB", "2023-04-22");
    const defCodes = parsed.items.map((item) => item.definitionCode);

    expect(defCodes).toContain("CACIB_V");
    expect(defCodes).toContain("VARACACIB");
  });

  it("maps KUMA and JUNS to canonical definitions", () => {
    const parsed = parseShowResultText("KUMA JUNS", "2023-04-22");
    const defCodes = parsed.items.map((item) => item.definitionCode);

    expect(defCodes).toContain("KP");
    expect(defCodes).toContain("JUN_SERT");
    expect(parsed.unmappedTokens).toEqual([]);
  });

  it("maps class aliases JU AVK VEK to canonical class names", () => {
    const jun = parseShowResultText("JU", "2023-04-22");
    const avo = parseShowResultText("AVK", "2023-04-22");
    const vet = parseShowResultText("VEK", "2023-04-22");

    expect(jun.className).toBe("JUN");
    expect(avo.className).toBe("AVO");
    expect(vet.className).toBe("VET");
    expect(jun.unmappedTokens).toEqual([]);
    expect(avo.unmappedTokens).toEqual([]);
    expect(vet.unmappedTokens).toEqual([]);
  });

  it("maps JMV alias to JMVA", () => {
    const parsed = parseShowResultText("JMV", "2023-04-22");
    expect(parsed.items.some((item) => item.definitionCode === "JMVA")).toBe(
      true,
    );
    expect(parsed.unmappedTokens).toEqual([]);
  });

  it("applies sure award aliases", () => {
    const parsed = parseShowResultText(
      "SER SAA ACCIB CACI VET-SER",
      "2023-04-22",
    );
    const defCodes = new Set(parsed.items.map((item) => item.definitionCode));
    expect(defCodes.has("SERT")).toBe(true);
    expect(defCodes.has("SA")).toBe(true);
    expect(defCodes.has("CACIB")).toBe(true);
    expect(defCodes.has("VET_SERT")).toBe(true);
    expect(parsed.unmappedTokens).toEqual([]);
  });

  it("normalizes mixed Kennelliitto-style award spellings to canonical codes", () => {
    const parsed = parseShowResultText(
      "JUN-SERT VSERT NORD-varaSERT",
      "2023-04-22",
    );
    const defCodes = new Set(parsed.items.map((item) => item.definitionCode));

    expect(defCodes.has("JUN_SERT")).toBe(true);
    expect(defCodes.has("VARASERT")).toBe(true);
    expect(defCodes.has("NORD_VARASERT")).toBe(true);
    expect(parsed.unmappedTokens).toEqual([]);
  });

  it("splits sure compound tokens", () => {
    const parsed = parseShowResultText(
      "PN1ROP PU1SA JUK2KP PN4FI59100/21",
      "2023-04-22",
    );
    const defCodes = parsed.items.map((item) => item.definitionCode);
    const pupnValues = parsed.items
      .filter((item) => item.definitionCode === "PUPN")
      .map((item) => item.valueCode);
    expect(pupnValues).toContain("PN1");
    expect(pupnValues).toContain("PU1");
    expect(defCodes).toContain("ROP");
    expect(defCodes).toContain("SA");
    expect(defCodes).toContain("KP");
    expect(parsed.className).toBe("JUN");
    expect(parsed.placement).toBe("2");
    expect(parsed.unmappedTokens).toContain("FI59100/21");
  });

  it("reports non-show tokens as unmapped", () => {
    const parsed = parseShowResultText(
      "KK S KESKIKOK JAK KOOKAS J AGI-VOI0 TOKO-ALO3 CACIT YLÄRAJ SERTK KUMAK KUPI AGI-ALO3 ALAPURENTA 2 5 42 37-38 VETSE JR JV VRO JSE KUK1 NUJ1 AVO11 NU01 OU1 OU2 PN1SA PURENTA ARKA HYVIN SUURI N",
      "2023-04-22",
    );
    expect(parsed.unmappedTokens.length).toBeGreaterThan(0);
    expect(parsed.unmappedTokens).toContain("KK");
    expect(parsed.unmappedTokens).toContain("CACIT");
    expect(parsed.unmappedTokens).toContain("VETSE");
    expect(parsed.unmappedTokens).toContain("TOKO-ALO3");
    expect(parsed.unmappedTokens).toContain("JR");
  });

  it("reports unknown tokens as unmapped", () => {
    const parsed = parseShowResultText("FOOBAR SA", "2023-04-22");
    expect(parsed.unmappedTokens).toContain("FOOBAR");
    expect(parsed.items.some((item) => item.definitionCode === "SA")).toBe(
      true,
    );
  });
});
