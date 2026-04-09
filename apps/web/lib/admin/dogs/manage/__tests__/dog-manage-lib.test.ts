import { describe, expect, it } from "vitest";
import {
  getAdminDogMutationErrorMessageKey,
  toAdminDogBreederOptions,
  toAdminDogParentOptions,
  toCreateAdminDogRequest,
} from "..";

describe("admin dog manage lib", () => {
  it("adds currently selected breeder to options when missing", () => {
    expect(
      toAdminDogBreederOptions([{ id: "b_1", name: "Metsapolun" }], "Korven"),
    ).toEqual([
      { id: "selected:Korven", name: "Korven" },
      { id: "b_1", name: "Metsapolun" },
    ]);
  });

  it("includes and deduplicates selected sire and dam parent options", () => {
    expect(
      toAdminDogParentOptions(
        [
          {
            id: "dog_2",
            name: "Korven Aatos",
            registrationNo: "FI54321/20",
            sex: "MALE",
          },
        ],
        {
          sirePreviewRegistrationNo: "FI54321/20",
          sirePreviewName: "Korven Aatos",
          damPreviewRegistrationNo: "FI77777/18",
          damPreviewName: "Havupolun Helmi",
        },
      ),
    ).toEqual([
      { registrationNo: "FI77777/18", name: "Havupolun Helmi" },
      { registrationNo: "FI54321/20", name: "Korven Aatos" },
    ]);
  });

  it("normalizes create payload fields for mutation requests", () => {
    expect(
      toCreateAdminDogRequest({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        birthDate: " 2021-04-09 ",
        breederNameText: " Metsapolun ",
        ownershipNames: ["Tiina Virtanen"],
        ekNo: " 5588 ",
        note: " Important note ",
        registrationNo: "FI12345/21 ",
        secondaryRegistrationNos: [" fi54321/21 ", "", " FI77777/18 "],
        sirePreviewName: "Korven Aatos",
        sirePreviewRegistrationNo: " FI54321/20 ",
        damPreviewName: "Havupolun Helmi",
        damPreviewRegistrationNo: "",
        titles: [
          { awardedOn: " 2022-01-10 ", titleCode: " FI JVA ", titleName: " " },
        ],
      }),
    ).toEqual({
      name: "Metsapolun Kide",
      sex: "FEMALE",
      birthDate: "2021-04-09",
      breederNameText: "Metsapolun",
      ownerNames: ["Tiina Virtanen"],
      ekNo: 5588,
      note: "Important note",
      registrationNo: "FI12345/21",
      secondaryRegistrationNos: ["FI54321/21", "FI77777/18"],
      sireRegistrationNo: "FI54321/20",
      damRegistrationNo: undefined,
      titles: [
        { awardedOn: "2022-01-10", titleCode: "FI JVA", titleName: null },
      ],
    });
  });

  it("maps unknown mutation errors to the default message key", () => {
    expect(getAdminDogMutationErrorMessageKey("UNKNOWN_ERROR")).toBe(
      "admin.dogs.mutation.errorDefault",
    );
  });
});
