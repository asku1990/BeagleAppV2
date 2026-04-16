import { describe, expect, it } from "vitest";
import { evaluateTrialValidationGaps } from "../trial-validation-gaps";

describe("evaluateTrialValidationGaps", () => {
  it("returns missing baseline gaps without row-level incompleteness when no trial is provided", () => {
    const evaluation = evaluateTrialValidationGaps(null);

    expect(evaluation.totalFieldCount).toBeGreaterThan(0);
    expect(evaluation.missingFromModel.length).toBeGreaterThan(0);
    expect(evaluation.availableButIncomplete).toEqual([]);
    expect(
      evaluation.missingFromModel.some(
        (item) => item.targetField === "sklKoeId",
      ),
    ).toBe(true);
  });

  it("returns row-level incomplete gaps for available fields with empty values", () => {
    const evaluation = evaluateTrialValidationGaps({
      trialId: "trial-1",
      dogId: null,
      dogName: "Rex",
      registrationNo: null,
      sklKoeId: 54321,
      entryKey: "entry-1",
      eventDate: "2026-04-14",
      eventName: null,
      eventPlace: "Helsinki",
      kennelDistrict: null,
      kennelDistrictNo: null,
      keli: null,
      paljasMaa: null,
      lumikeli: null,
      luokka: null,
      palkinto: null,
      loppupisteet: null,
      sijoitus: null,
      hakuKeskiarvo: null,
      haukkuKeskiarvo: null,
      yleisvaikutelmaPisteet: null,
      hakuloysyysTappioYhteensa: null,
      ajoloysyysTappioYhteensa: null,
      tieJaEstetyoskentelyPisteet: null,
      metsastysintoPisteet: null,
      ylituomariNimi: null,
      rokotusOk: null,
      tunnistusOk: null,
      notes: null,
      rawPayloadJson: null,
      rawPayloadAvailable: false,
      createdAt: "2026-04-14T10:00:00.000Z",
      updatedAt: "2026-04-14T10:00:00.000Z",
    });

    expect(
      evaluation.availableButIncomplete.some(
        (item) =>
          item.targetField === "rekisterinumero" &&
          item.status === "available_but_incomplete",
      ),
    ).toBe(true);
    expect(
      evaluation.availableButIncomplete.some(
        (item) =>
          item.targetField === "kennelpiiri" &&
          item.status === "available_but_incomplete",
      ),
    ).toBe(true);
    expect(
      evaluation.availableButIncomplete.some(
        (item) =>
          item.targetField === "rokotusOk" &&
          item.status === "available_but_incomplete",
      ),
    ).toBe(true);
    expect(
      evaluation.availableButIncomplete.some(
        (item) =>
          item.targetField === "paljasMaa" &&
          item.status === "available_but_incomplete",
      ),
    ).toBe(true);
  });
});
