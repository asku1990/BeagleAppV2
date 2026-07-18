import { describe, expect, it } from "vitest";
import { messages } from "@/lib/i18n/messages";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { getAdminDogDiseaseCreateErrorMessageKey } from "../create-error";

describe("getAdminDogDiseaseCreateErrorMessageKey", () => {
  it("maps an existing dog match to the localized disease error", () => {
    expect(
      getAdminDogDiseaseCreateErrorMessageKey(
        new AdminMutationError(
          "A dog exists with this registration number.",
          "LITTER_REGISTRATION_MATCHES_DOG",
        ),
      ),
    ).toBe("admin.dogs.diseases.create.errorLitterRegistrationMatchesDog");
  });

  it("leaves unrelated errors unchanged", () => {
    expect(
      getAdminDogDiseaseCreateErrorMessageKey(
        new AdminMutationError("Dog was not found.", "DOG_NOT_FOUND"),
      ),
    ).toBeNull();
    expect(getAdminDogDiseaseCreateErrorMessageKey(new Error("Failed"))).toBe(
      null,
    );
  });

  it("provides Finnish and Swedish guidance for the existing dog match", () => {
    const key = "admin.dogs.diseases.create.errorLitterRegistrationMatchesDog";

    expect(messages.fi[key]).toContain("Koira-tyyppisenä");
    expect(messages.sv[key]).toContain("typen Hund");
  });
});
