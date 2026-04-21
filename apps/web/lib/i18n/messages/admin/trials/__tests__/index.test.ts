import { describe, expect, it } from "vitest";
import { fiAdminTrialsMessages, svAdminTrialsMessages } from "../index";

describe("admin trial message index", () => {
  it("merges manage and detail message groups", () => {
    expect(fiAdminTrialsMessages["admin.trials.manage.events.title"]).toBe(
      "Tapahtumat",
    );
    expect(fiAdminTrialsMessages["admin.trials.detail.title"]).toBe(
      "Koetuloksen detalji",
    );
    expect(svAdminTrialsMessages["admin.trials.manage.events.title"]).toBe(
      "Evenemang",
    );
    expect(svAdminTrialsMessages["admin.trials.detail.title"]).toBe(
      "Provresultatdetalj",
    );
  });
});
