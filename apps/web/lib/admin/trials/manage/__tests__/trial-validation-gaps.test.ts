import { describe, expect, it } from "vitest";
import { evaluateTrialValidationGaps } from "../trial-validation-gaps";

describe("evaluateTrialValidationGaps", () => {
  it("returns missing baseline gaps without row-level incompleteness when no trial is provided", () => {
    const evaluation = evaluateTrialValidationGaps(null);

    expect(evaluation.totalFieldCount).toBeGreaterThan(0);
    expect(evaluation.missingFromModel).toEqual([]);
    expect(evaluation.availableButIncomplete).toEqual([]);
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
      rotukoodi: null,
      jarjestaja: null,
      koemuoto: null,
      kennelDistrict: null,
      kennelDistrictNo: null,
      ylituomariNumero: null,
      keli: null,
      luokka: null,
      koiriaLuokassa: null,
      palkinto: null,
      loppupisteet: null,
      sijoitus: null,
      era1Alkoi: null,
      era2Alkoi: null,
      hakuMin1: null,
      hakuMin2: null,
      ajoMin1: null,
      ajoMin2: null,
      hyvaksytytAjominuutit: null,
      ajoajanPisteet: null,
      ansiopisteetYhteensa: null,
      hakuKeskiarvo: null,
      haukkuKeskiarvo: null,
      ajotaitoKeskiarvo: null,
      yleisvaikutelmaPisteet: null,
      hakuloysyysTappioYhteensa: null,
      ajoloysyysTappioYhteensa: null,
      tappiopisteetYhteensa: null,
      tieJaEstetyoskentelyPisteet: null,
      metsastysintoPisteet: null,
      ylituomariNimi: null,
      ryhmatuomariNimi: null,
      palkintotuomariNimi: null,
      isanNimi: null,
      isanRekisterinumero: null,
      emanNimi: null,
      emanRekisterinumero: null,
      omistaja: null,
      omistajanKotikunta: null,
      sukupuoli: null,
      rokotusOk: null,
      tunnistusOk: null,
      luopui: null,
      suljettu: null,
      keskeytetty: null,
      huomautusTeksti: null,
      lisatiedotJson: null,
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
          item.targetField === "keli" &&
          item.status === "available_but_incomplete",
      ),
    ).toBe(true);
  });
});
