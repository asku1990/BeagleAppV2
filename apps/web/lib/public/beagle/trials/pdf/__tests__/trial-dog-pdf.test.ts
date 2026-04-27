import { describe, expect, it } from "vitest";
import {
  canRenderTrialDogPdf,
  getSeededTrialDogPdfRuleWindowIds,
  getTrialDogPdfRuleSetId,
  getTrialDogPdfRuleSetStatus,
  getTrialDogPdfTemplateFileName,
  renderTrialDogPdf,
} from "../trial-dog-pdf";

describe("renderTrialDogPdf", () => {
  it("renders pdf bytes when lisatiedot sections are omitted", async () => {
    const bytes = await renderTrialDogPdf({
      trialRuleWindowId: "trw_post_20110801",
      registrationNo: "FI12345/21",
      dogName: null,
      dogSex: "MALE",
      sireName: null,
      sireRegistrationNo: null,
      damName: null,
      damRegistrationNo: null,
      omistaja: null,
      omistajanKotikunta: null,
      kennelpiiri: null,
      kennelpiirinro: null,
      koekunta: null,
      koemaasto: null,
      koepaiva: new Date("2025-09-07T00:00:00.000Z"),
      jarjestaja: null,
      era1Alkoi: null,
      era2Alkoi: null,
      hakuMin1: null,
      hakuMin2: null,
      ajoMin1: null,
      ajoMin2: null,
      hyvaksytytAjominuutit: null,
      ajoajanPisteet: null,
      hakuEra1: null,
      hakuEra2: null,
      hakuKeskiarvo: null,
      haukkuEra1: null,
      haukkuEra2: null,
      haukkuKeskiarvo: null,
      hakuloysyysTappioEra1: null,
      hakuloysyysTappioEra2: null,
      hakuloysyysTappioYhteensa: null,
      ajoloysyysTappioEra1: null,
      ajoloysyysTappioEra2: null,
      ajoloysyysTappioYhteensa: null,
      tappiopisteetYhteensa: null,
      ajotaitoEra1: 4,
      ajotaitoEra2: 2,
      ajotaitoKeskiarvo: 3,
      ansiopisteetYhteensa: 0,
      loppupisteet: 0,
      paljasMaaTaiLumi: null,
      luopui: false,
      suljettu: false,
      keskeytetty: false,
      koetyyppi: "NORMAL",
      sijoitus: null,
      koiriaLuokassa: null,
      Palkinto: "1",
      huomautusTeksti: null,
      ryhmatuomariNimi: null,
      palkintotuomariNimi: null,
      ylituomariNumeroSnapshot: null,
      ylituomariNimiSnapshot: null,
    });

    expect(Buffer.from(bytes).toString("latin1", 0, 4)).toBe("%PDF");
  });

  it("does not overlay dynamic fields on the unfinished 2005-2011 template", async () => {
    const bytes = await renderTrialDogPdf({
      trialRuleWindowId: "trw_range_2005_2011",
      registrationNo: "SHOULD-NOT-RENDER-2005",
      dogName: "SHOULD-NOT-RENDER-DOG",
      dogSex: "MALE",
      sireName: null,
      sireRegistrationNo: null,
      damName: null,
      damRegistrationNo: null,
      omistaja: null,
      omistajanKotikunta: null,
      kennelpiiri: null,
      kennelpiirinro: null,
      koekunta: null,
      koemaasto: null,
      koepaiva: new Date("2008-09-07T00:00:00.000Z"),
      jarjestaja: null,
      era1Alkoi: null,
      era2Alkoi: null,
      hakuMin1: null,
      hakuMin2: null,
      ajoMin1: null,
      ajoMin2: null,
      hyvaksytytAjominuutit: null,
      ajoajanPisteet: null,
      hakuEra1: null,
      hakuEra2: null,
      hakuKeskiarvo: null,
      haukkuEra1: null,
      haukkuEra2: null,
      haukkuKeskiarvo: null,
      hakuloysyysTappioEra1: null,
      hakuloysyysTappioEra2: null,
      hakuloysyysTappioYhteensa: null,
      ajoloysyysTappioEra1: null,
      ajoloysyysTappioEra2: null,
      ajoloysyysTappioYhteensa: null,
      tappiopisteetYhteensa: null,
      ajotaitoEra1: 4,
      ajotaitoEra2: 2,
      ajotaitoKeskiarvo: 3,
      ansiopisteetYhteensa: 0,
      loppupisteet: 0,
      paljasMaaTaiLumi: null,
      luopui: false,
      suljettu: false,
      keskeytetty: false,
      koetyyppi: "NORMAL",
      sijoitus: null,
      koiriaLuokassa: null,
      Palkinto: "1",
      huomautusTeksti: null,
      ryhmatuomariNimi: null,
      palkintotuomariNimi: null,
      ylituomariNumeroSnapshot: null,
      ylituomariNimiSnapshot: null,
    });

    const rawPdf = Buffer.from(bytes).toString("latin1");

    expect(rawPdf).not.toContain("SHOULD-NOT-RENDER-2005");
    expect(rawPdf).not.toContain("SHOULD-NOT-RENDER-DOG");
  });

  it.each([
    ["trw_pre_20020801", null],
    ["trw_range_2002_2005", null],
    ["trw_range_2005_2011", "ajok-poytakirja-2005-2011.pdf"],
    ["trw_post_20110801", "ajok-poytakirja-2011-2023.pdf"],
    ["trw_post_20230801", null],
    [null, null],
    ["unknown-window", null],
  ])(
    "selects the PDF template for rule window %s",
    (ruleWindowId, expected) => {
      expect(getTrialDogPdfTemplateFileName(ruleWindowId)).toBe(expected);
    },
  );

  it("declares a PDF rule set for every seeded trial rule window", () => {
    expect(getSeededTrialDogPdfRuleWindowIds().sort()).toEqual([
      "trw_post_20110801",
      "trw_post_20230801",
      "trw_pre_20020801",
      "trw_range_2002_2005",
      "trw_range_2005_2011",
    ]);
  });

  it("keeps unfinished rule sets blank-only", () => {
    expect(getTrialDogPdfRuleSetStatus("trw_pre_20020801")).toBe("blank-only");
    expect(getTrialDogPdfRuleSetStatus("trw_range_2002_2005")).toBe(
      "blank-only",
    );
    expect(getTrialDogPdfRuleSetStatus("trw_range_2005_2011")).toBe(
      "blank-only",
    );
    expect(getTrialDogPdfRuleSetStatus("trw_post_20230801")).toBe("blank-only");
  });

  it("only marks the 2011-2023 timeline as implemented", () => {
    expect(getTrialDogPdfRuleSetId("trw_post_20110801")).toBe(
      "legacy-2011-2023",
    );
    expect(getTrialDogPdfRuleSetStatus("trw_post_20110801")).toBe(
      "implemented",
    );
    expect(canRenderTrialDogPdf("trw_post_20110801")).toBe(true);
    expect(getTrialDogPdfRuleSetId("trw_post_20230801")).toBe(
      "post-2023-unimplemented",
    );
    expect(getTrialDogPdfRuleSetStatus("trw_post_20230801")).toBe("blank-only");
    expect(canRenderTrialDogPdf("trw_post_20230801")).toBe(false);
  });

  it("does not fall back to another timeline for unknown rule windows", async () => {
    await expect(
      renderTrialDogPdf({
        trialRuleWindowId: "unknown-window",
        registrationNo: "SHOULD-NOT-RENDER-UNKNOWN",
        dogName: "SHOULD-NOT-RENDER-DOG",
        dogSex: "MALE",
        sireName: null,
        sireRegistrationNo: null,
        damName: null,
        damRegistrationNo: null,
        omistaja: null,
        omistajanKotikunta: null,
        kennelpiiri: null,
        kennelpiirinro: null,
        koekunta: null,
        koemaasto: null,
        koepaiva: new Date("2025-09-07T00:00:00.000Z"),
        jarjestaja: null,
        era1Alkoi: null,
        era2Alkoi: null,
        hakuMin1: null,
        hakuMin2: null,
        ajoMin1: null,
        ajoMin2: null,
        hyvaksytytAjominuutit: null,
        ajoajanPisteet: null,
        hakuEra1: null,
        hakuEra2: null,
        hakuKeskiarvo: null,
        haukkuEra1: null,
        haukkuEra2: null,
        haukkuKeskiarvo: null,
        hakuloysyysTappioEra1: null,
        hakuloysyysTappioEra2: null,
        hakuloysyysTappioYhteensa: null,
        ajoloysyysTappioEra1: null,
        ajoloysyysTappioEra2: null,
        ajoloysyysTappioYhteensa: null,
        tappiopisteetYhteensa: null,
        ajotaitoEra1: 4,
        ajotaitoEra2: 2,
        ajotaitoKeskiarvo: 3,
        ansiopisteetYhteensa: 0,
        loppupisteet: 0,
        paljasMaaTaiLumi: null,
        luopui: false,
        suljettu: false,
        keskeytetty: false,
        koetyyppi: "NORMAL",
        sijoitus: null,
        koiriaLuokassa: null,
        Palkinto: "1",
        huomautusTeksti: null,
        ryhmatuomariNimi: null,
        palkintotuomariNimi: null,
        ylituomariNumeroSnapshot: null,
        ylituomariNimiSnapshot: null,
      }),
    ).rejects.toThrow("PDF rule set unsupported has no template.");
  });
});
