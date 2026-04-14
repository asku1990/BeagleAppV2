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
      dogId: "dog-1",
      dogName: "Rex",
      registrationNo: null,
      eventDate: "2026-04-14",
      eventName: null,
      eventPlace: "Helsinki",
      kennelDistrict: null,
      kennelDistrictNo: null,
      ke: null,
      lk: null,
      pa: null,
      piste: null,
      sija: null,
      haku: null,
      hauk: null,
      yva: null,
      hlo: null,
      alo: null,
      tja: null,
      pin: null,
      judge: null,
      legacyFlag: null,
      sourceKey: "source-1",
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
  });
});
