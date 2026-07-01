import { describe, expect, it } from "vitest";
import {
  FALLBACK_VALUE,
  formatDate,
  formatNumber,
  formatPlacement,
} from "../../../trials/display-formatters";

describe("trials-laaja-formatters", () => {
  it("formats normal placements as rank / class count", () => {
    expect(
      formatPlacement({
        id: "trial-1",
        trialEntryId: "trial-entry-1",
        trialId: "event-1",
        trialRuleWindowId: null,
        hasDogTrialPdf: false,
        place: "Turku",
        date: "2025-06-01",
        weather: null,
        koetyyppi: "NORMAL",
        koiriaLuokassa: 12,
        rank: "1",
        points: null,
        award: null,
        judge: null,
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        tja: null,
        pin: null,
      }),
    ).toBe("1 / 12");
  });

  it("formats kokokauden koe placements with KK suffix", () => {
    expect(
      formatPlacement({
        id: "trial-2",
        trialEntryId: "trial-entry-2",
        trialId: "event-2",
        trialRuleWindowId: null,
        hasDogTrialPdf: false,
        place: "Turku",
        date: "2025-06-01",
        weather: null,
        koetyyppi: "KOKOKAUDENKOE",
        koiriaLuokassa: 12,
        rank: "1",
        points: null,
        award: null,
        judge: null,
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        tja: null,
        pin: null,
      }),
    ).toBe("1 / 12 KK");
  });

  it("formats pitkä koe placements with PK suffix", () => {
    expect(
      formatPlacement({
        id: "trial-3",
        trialEntryId: "trial-entry-3",
        trialId: "event-3",
        trialRuleWindowId: null,
        hasDogTrialPdf: false,
        place: "Turku",
        date: "2025-06-01",
        weather: null,
        koetyyppi: "PITKAKOE",
        koiriaLuokassa: 12,
        rank: "1",
        points: null,
        award: null,
        judge: null,
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        tja: null,
        pin: null,
      }),
    ).toBe("1 / 12 PK");
  });

  it("falls back when placement data is missing", () => {
    expect(
      formatPlacement({
        id: "trial-4",
        trialEntryId: "trial-entry-4",
        trialId: "event-4",
        trialRuleWindowId: null,
        hasDogTrialPdf: false,
        place: "Turku",
        date: "2025-06-01",
        weather: null,
        koetyyppi: "NORMAL",
        koiriaLuokassa: null,
        rank: "  ",
        points: null,
        award: null,
        judge: null,
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        tja: null,
        pin: null,
      }),
    ).toBe(FALLBACK_VALUE);
  });

  it("formats null numeric values as fallback", () => {
    expect(formatNumber(null)).toBe(FALLBACK_VALUE);
  });

  it("formats valid date values", () => {
    expect(formatDate("2025-06-01", "fi")).not.toBe(FALLBACK_VALUE);
  });
});
