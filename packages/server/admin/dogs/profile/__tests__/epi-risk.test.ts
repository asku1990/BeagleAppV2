import { describe, expect, it } from "vitest";
import { calculateAdminDogEpiSummary } from "../internal/epi-risk";

describe("calculateAdminDogEpiSummary", () => {
  it("calculates EPI, Lafora, and risk for an admin profile dog", () => {
    const summary = calculateAdminDogEpiSummary(
      "dog-1",
      {
        rootId: "dog-1",
        nodes: {
          "dog-1": {
            id: "dog-1",
            sireId: "sire-1",
            damId: "dam-1",
            siitosasteProsentti: null,
          },
          "sire-1": {
            id: "sire-1",
            sireId: "grand-sire-1",
            damId: "grand-dam-1",
            siitosasteProsentti: null,
          },
          "dam-1": {
            id: "dam-1",
            sireId: "grand-sire-2",
            damId: "grand-dam-2",
            siitosasteProsentti: null,
          },
          "grand-sire-1": {
            id: "grand-sire-1",
            sireId: null,
            damId: null,
            siitosasteProsentti: null,
          },
          "grand-dam-1": {
            id: "grand-dam-1",
            sireId: null,
            damId: null,
            siitosasteProsentti: null,
          },
          "grand-sire-2": {
            id: "grand-sire-2",
            sireId: null,
            damId: null,
            siitosasteProsentti: null,
          },
          "grand-dam-2": {
            id: "grand-dam-2",
            sireId: null,
            damId: null,
            siitosasteProsentti: null,
          },
        },
      },
      [
        {
          dogId: "dog-1",
          isaDogId: "sire-1",
          emaDogId: "dam-1",
          sairausKoodi: "epi",
          evidenceKind: "DOG",
        },
        {
          dogId: "sire-1",
          isaDogId: "grand-sire-1",
          emaDogId: "grand-dam-1",
          sairausKoodi: "lepik",
          evidenceKind: "DOG",
        },
      ],
    );

    expect(summary).toEqual({
      epiLuku: 1.5,
      epiTeksti: "I----",
      laforaLuku: 1.5,
      epiRiskLuku: 4,
    });
  });

  it("returns empty EPI text when the root has no direct evidence", () => {
    const summary = calculateAdminDogEpiSummary(
      "dog-1",
      {
        rootId: "dog-1",
        nodes: {
          "dog-1": {
            id: "dog-1",
            sireId: "sire-1",
            damId: "dam-1",
            siitosasteProsentti: null,
          },
        },
      },
      [],
    );

    expect(summary.epiLuku).toBe(0);
    expect(summary.epiTeksti).toBe("-----");
  });

  it("preserves v1 EPI precision before profile formatting", () => {
    const summary = calculateAdminDogEpiSummary(
      "dog-1",
      {
        rootId: "dog-1",
        nodes: {
          "dog-1": {
            id: "dog-1",
            sireId: "sire-1",
            damId: "dam-1",
            siitosasteProsentti: null,
          },
          "dam-1": {
            id: "dam-1",
            sireId: null,
            damId: null,
            siitosasteProsentti: null,
          },
          "sire-1": {
            id: "sire-1",
            sireId: "grand-sire-1",
            damId: null,
            siitosasteProsentti: null,
          },
          "grand-sire-1": {
            id: "grand-sire-1",
            sireId: "third-sire-1",
            damId: null,
            siitosasteProsentti: null,
          },
          "third-sire-1": {
            id: "third-sire-1",
            sireId: "fourth-sire-1",
            damId: null,
            siitosasteProsentti: null,
          },
          "fourth-sire-1": {
            id: "fourth-sire-1",
            sireId: "fifth-sire-1",
            damId: "fifth-dam-1",
            siitosasteProsentti: null,
          },
        },
      },
      [
        {
          dogId: "dog-1",
          isaDogId: "sire-1",
          emaDogId: "dam-1",
          sairausKoodi: "epi",
          evidenceKind: "DOG",
        },
        {
          dogId: "fourth-sire-full-sibling-1",
          isaDogId: "fifth-sire-1",
          emaDogId: "fifth-dam-1",
          sairausKoodi: "epi",
          evidenceKind: "DOG",
        },
        {
          dogId: "fifth-sire-1",
          isaDogId: null,
          emaDogId: null,
          sairausKoodi: "epi",
          evidenceKind: "DOG",
        },
      ],
    );

    expect(summary.epiLuku).toBe(1.5625);
    expect(summary.epiTeksti).toBe("I----");
  });

  it("returns half-sibling EPI text for pseudo evidence rows with parent links", () => {
    const summary = calculateAdminDogEpiSummary(
      "dog-1",
      {
        rootId: "dog-1",
        nodes: {
          "dog-1": {
            id: "dog-1",
            sireId: "sire-1",
            damId: "dam-1",
            siitosasteProsentti: null,
          },
        },
      },
      [
        {
          dogId: null,
          isaDogId: "sire-1",
          emaDogId: "other-dam",
          sairausKoodi: "epi",
          evidenceKind: "LITTER",
        },
      ],
    );

    expect(summary.epiLuku).toBe(0.5);
    expect(summary.epiTeksti).toBe("----P");
  });

  it("returns offspring and half-sibling EPI text together", () => {
    const summary = calculateAdminDogEpiSummary(
      "dog-1",
      {
        rootId: "dog-1",
        nodes: {
          "dog-1": {
            id: "dog-1",
            sireId: "sire-1",
            damId: "dam-1",
            siitosasteProsentti: null,
          },
        },
      },
      [
        {
          dogId: "offspring-1",
          isaDogId: "dog-1",
          emaDogId: "offspring-dam",
          sairausKoodi: "epi",
          evidenceKind: "DOG",
        },
        {
          dogId: "half-sibling-1",
          isaDogId: "sire-1",
          emaDogId: "other-dam",
          sairausKoodi: "epi",
          evidenceKind: "DOG",
        },
      ],
    );

    expect(summary.epiLuku).toBe(1);
    expect(summary.epiTeksti).toBe("---JP");
  });

  it("returns mixed EPI text when all root evidence markers are present", () => {
    const summary = calculateAdminDogEpiSummary(
      "dog-1",
      {
        rootId: "dog-1",
        nodes: {
          "dog-1": {
            id: "dog-1",
            sireId: "sire-1",
            damId: "dam-1",
            siitosasteProsentti: null,
          },
          "sire-1": {
            id: "sire-1",
            sireId: null,
            damId: null,
            siitosasteProsentti: null,
          },
        },
      },
      [
        {
          dogId: "dog-1",
          isaDogId: "sire-1",
          emaDogId: "dam-1",
          sairausKoodi: "epi",
          evidenceKind: "DOG",
        },
        {
          dogId: "full-sibling-1",
          isaDogId: "sire-1",
          emaDogId: "dam-1",
          sairausKoodi: "epi",
          evidenceKind: "DOG",
        },
        {
          dogId: "sire-1",
          isaDogId: null,
          emaDogId: null,
          sairausKoodi: "epi",
          evidenceKind: "DOG",
        },
        {
          dogId: "offspring-1",
          isaDogId: "dog-1",
          emaDogId: "offspring-dam",
          sairausKoodi: "epi",
          evidenceKind: "DOG",
        },
        {
          dogId: "half-sibling-1",
          isaDogId: "sire-1",
          emaDogId: "other-dam",
          sairausKoodi: "epi",
          evidenceKind: "DOG",
        },
      ],
    );

    expect(summary.epiLuku).toBe(3.75);
    expect(summary.epiTeksti).toBe("ISVJP");
  });
});
