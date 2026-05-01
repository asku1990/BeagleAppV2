import { describe, expect, it } from "vitest";
import { fiAdminTrialsMessages, svAdminTrialsMessages } from "../index";

describe("admin trial message index", () => {
  it("exports manage message groups", () => {
    expect(fiAdminTrialsMessages["admin.trials.manage.events.title"]).toBe(
      "Tapahtumat",
    );
    expect(
      fiAdminTrialsMessages["admin.trials.manage.selected.actions.openPdf"],
    ).toBe("Avaa pöytäkirja");
    expect(svAdminTrialsMessages["admin.trials.manage.events.title"]).toBe(
      "Evenemang",
    );
    expect(
      svAdminTrialsMessages["admin.trials.manage.selected.actions.openPdf"],
    ).toBe("Öppna protokoll");
  });
});
