import { describe, expect, it } from "vitest";
import {
  resolveCreateDiseaseSelectedCode,
  toCreateDiseaseRequest,
  type CreateDiseaseFormValues,
} from "../create-disease-form-state";

describe("resolveCreateDiseaseSelectedCode", () => {
  it("keeps the current disease code when it exists", () => {
    expect(resolveCreateDiseaseSelectedCode("pur", "epi")).toBe("pur");
  });

  it("falls back to the browse selection when current code is missing", () => {
    expect(resolveCreateDiseaseSelectedCode(undefined, "pur")).toBe("pur");
    expect(resolveCreateDiseaseSelectedCode(null, "pur")).toBe("pur");
  });

  it("falls back to epi when neither code is available", () => {
    expect(resolveCreateDiseaseSelectedCode(undefined, undefined)).toBe("epi");
  });

  it("submits visible parent registrations only for litter evidence", () => {
    const values: CreateDiseaseFormValues = {
      evidenceKind: "LITTER",
      diseaseCode: "epi",
      registrationNo: "TESTI1",
      sireRegistrationNo: "SE50296/2021",
      damRegistrationNo: "SE52916/2023",
      litter: "",
      description: "",
      source: "",
      public: false,
    };

    expect(toCreateDiseaseRequest(values)).toMatchObject({
      evidenceKind: "LITTER",
      sireRegistrationNo: "SE50296/2021",
      damRegistrationNo: "SE52916/2023",
    });
    expect(
      toCreateDiseaseRequest({ ...values, evidenceKind: "DOG" }),
    ).toMatchObject({
      evidenceKind: "DOG",
      sireRegistrationNo: null,
      damRegistrationNo: null,
    });
  });
});
