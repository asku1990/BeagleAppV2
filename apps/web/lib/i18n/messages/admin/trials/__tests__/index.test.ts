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
    expect(
      fiAdminTrialsMessages["admin.trials.manage.selected.actions.more"],
    ).toBe("Lisää toimintoja");
    expect(
      fiAdminTrialsMessages["admin.trials.manage.selected.actions.editEvent"],
    ).toBe("Muokkaa tapahtumaa");
    expect(
      fiAdminTrialsMessages["admin.trials.manage.workspace.notFound"],
    ).toBe("Ajokoetapahtumaa ei löytynyt.");
    expect(
      fiAdminTrialsMessages[
        "admin.trials.manage.selected.actions.openWorkspace"
      ],
    ).toBe("Avaa tapahtuman sivu");
    expect(svAdminTrialsMessages["admin.trials.manage.events.title"]).toBe(
      "Evenemang",
    );
    expect(
      svAdminTrialsMessages["admin.trials.manage.selected.actions.openPdf"],
    ).toBe("Öppna protokoll");
    expect(
      svAdminTrialsMessages["admin.trials.manage.selected.actions.more"],
    ).toBe("Fler åtgärder");
    expect(
      svAdminTrialsMessages["admin.trials.manage.selected.actions.editEvent"],
    ).toBe("Redigera evenemang");
    expect(
      svAdminTrialsMessages["admin.trials.manage.workspace.notFound"],
    ).toBe("Jaktprovsevenemanget hittades inte.");
    expect(
      svAdminTrialsMessages[
        "admin.trials.manage.selected.actions.openWorkspace"
      ],
    ).toBe("Öppna evenemangssidan");
  });
});
