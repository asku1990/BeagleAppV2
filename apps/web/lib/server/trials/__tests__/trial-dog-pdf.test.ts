import { describe, expect, it } from "vitest";
import { renderTrialDogPdf } from "../trial-dog-pdf";

describe("renderTrialDogPdf", () => {
  it("renders pdf bytes from a registration number", async () => {
    const bytes = await renderTrialDogPdf({
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
      koepaiva: new Date("2025-09-07T00:00:00.000Z"),
      jarjeastaja: null,
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
      haukkuEra1: null,
      haukkuEra2: null,
      ajotaitoEra1: 4,
      ajotaitoEra2: 2,
    });

    expect(Buffer.from(bytes).toString("latin1", 0, 4)).toBe("%PDF");
  });
});
