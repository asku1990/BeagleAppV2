import { describe, expect, it } from "vitest";
import {
  addOwnerFromCandidate,
  appendSecondaryRegistration,
  appendTitle,
  moveTitleDown,
  moveTitleUp,
  removeOwnerByName,
  removeSecondaryRegistrationAt,
  removeTitleAt,
  setSecondaryRegistrationAt,
  updateTitleAt,
} from "../dog-form-section-updates";
import type { AdminDogFormValues } from "@/components/admin/dogs/types";

function createValues(): AdminDogFormValues {
  return {
    name: "Metsapolun Kide",
    sex: "FEMALE",
    birthDate: "",
    breederNameText: "Metsapolun",
    ownershipNames: ["Tiina Virtanen"],
    ekNo: "5588",
    note: "",
    registrationNo: "FI12345/21",
    secondaryRegistrationNos: ["FI54321/21"],
    sirePreviewName: "",
    sirePreviewRegistrationNo: "",
    damPreviewName: "",
    damPreviewRegistrationNo: "",
    titles: [
      { awardedOn: "", titleCode: "FI JVA", titleName: "Valio" },
      { awardedOn: "", titleCode: "FI MVA", titleName: "Muotovalio" },
    ],
  };
}

describe("dog form section updates", () => {
  it("handles secondary registration add/update/remove", () => {
    const withAdded = appendSecondaryRegistration(createValues());
    expect(withAdded.secondaryRegistrationNos).toEqual(["FI54321/21", ""]);

    const withUpdated = setSecondaryRegistrationAt(withAdded, 1, "fi77777/18");
    expect(withUpdated.secondaryRegistrationNos).toEqual([
      "FI54321/21",
      "FI77777/18",
    ]);

    const withRemoved = removeSecondaryRegistrationAt(withUpdated, 0);
    expect(withRemoved.secondaryRegistrationNos).toEqual(["FI77777/18"]);
  });

  it("handles owner add/remove with candidate validation", () => {
    const values = createValues();
    const result = addOwnerFromCandidate(values, "o_2", [
      { id: "o_1", name: "Tiina Virtanen" },
      { id: "o_2", name: "Antti Virtanen" },
    ]);

    expect(result.values.ownershipNames).toEqual([
      "Tiina Virtanen",
      "Antti Virtanen",
    ]);
    expect(result.ownerCandidate).toBe("");

    const removed = removeOwnerByName(result.values, "Tiina Virtanen");
    expect(removed.ownershipNames).toEqual(["Antti Virtanen"]);
  });

  it("handles title add/reorder/remove and awarded date updates", () => {
    const appended = appendTitle(createValues());
    expect(appended.titles).toHaveLength(3);

    const withAwardedOn = updateTitleAt(appended, 2, {
      awardedOn: "2024-01-01",
    });
    expect(withAwardedOn.titles[2].awardedOn).toBe("2024-01-01");

    const movedUp = moveTitleUp(withAwardedOn, 2);
    expect(movedUp.titles[1].titleCode).toBe("");

    const movedDown = moveTitleDown(movedUp, 1);
    expect(movedDown.titles[2].titleCode).toBe("");

    const removed = removeTitleAt(movedDown, 2);
    expect(removed.titles).toHaveLength(2);
  });
});
