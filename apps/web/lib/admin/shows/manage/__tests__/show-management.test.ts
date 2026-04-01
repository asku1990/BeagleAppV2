import { describe, expect, it } from "vitest";
import {
  addEntryAward,
  createManageShowAward,
  removeEntryAward,
} from "../show-management";
import type { ManageShowEntry } from "@/components/admin/shows/manage/show-management-types";

function makeEntry(): ManageShowEntry {
  return {
    id: "entry-1",
    registrationNo: "FI12345/21",
    dogName: "Metsapolun Kide",
    judge: "Judge",
    critiqueText: "Critique",
    heightCm: "38",
    classCode: "AVO",
    qualityGrade: "ERI",
    classPlacement: "1",
    pupn: "PU1",
    awards: [],
  };
}

describe("show management award helpers", () => {
  it("removes only the targeted award after consecutive additions", () => {
    const entries = [makeEntry()];
    const withSert = addEntryAward(
      entries,
      "entry-1",
      createManageShowAward("award-1", "SERT"),
    );
    const withBoth = addEntryAward(
      withSert,
      "entry-1",
      createManageShowAward("award-2", "varaSERT"),
    );
    const afterRemoval = removeEntryAward(withBoth, "entry-1", "award-1");

    expect(afterRemoval[0]?.awards).toEqual([
      { id: "award-2", code: "varaSERT" },
    ]);
  });

  it("does not add duplicate award codes", () => {
    const entries = [makeEntry()];
    const withSert = addEntryAward(
      entries,
      "entry-1",
      createManageShowAward("award-1", "SERT"),
    );
    const withDuplicate = addEntryAward(
      withSert,
      "entry-1",
      createManageShowAward("award-2", "SERT"),
    );

    expect(withDuplicate[0]?.awards).toEqual([{ id: "award-1", code: "SERT" }]);
  });
});
