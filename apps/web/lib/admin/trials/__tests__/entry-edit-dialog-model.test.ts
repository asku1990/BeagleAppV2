import { describe, expect, it } from "vitest";
import type { AdminTrialEventEntry } from "@beagle/contracts";
import {
  createEmptyEraDraft,
  toLisatietoRows,
} from "../entry-edit-dialog-model";

function entryWithLisatiedot(
  lisatiedotByEra: Array<{
    era: number;
    lisatiedot: NonNullable<AdminTrialEventEntry["eras"]>[number]["lisatiedot"];
  }>,
): AdminTrialEventEntry {
  return {
    trialId: "entry-1",
    dogId: null,
    dogName: "Rex",
    registrationNo: "FI123",
    entryKey: "entry-1",
    koemuoto: "AJOK",
    koetyyppi: "NORMAL",
    rank: null,
    award: null,
    points: null,
    judge: null,
    eras: lisatiedotByEra.map((item) => ({
      era: item.era,
      alkoi: null,
      hakumin: null,
      ajomin: null,
      haku: null,
      hauk: null,
      yva: null,
      hlo: null,
      alo: null,
      tja: null,
      pin: null,
      huomautusTeksti: null,
      lisatiedot: item.lisatiedot,
    })),
  };
}

describe("entry edit lisatiedot model", () => {
  it("creates all known grouped lisatieto rows", () => {
    const rows = toLisatietoRows(entryWithLisatiedot([]), [
      createEmptyEraDraft(1),
      createEmptyEraDraft(2),
    ]);

    expect(rows.map((row) => row.koodi)).toEqual(
      expect.arrayContaining(["10", "19", "23", "37", "57", "58", "59", "62"]),
    );
    expect(rows.find((row) => row.koodi === "10")).toMatchObject({
      group: "olosuhteet",
      label: "Vaativat olosuhteet",
      inputKind: "marker",
    });
    expect(rows.find((row) => row.koodi === "62")).toMatchObject({
      group: "muut_ominaisuudet",
      label: "Matka ajoerässä",
    });
  });

  it("preserves values and metadata by koodi and osa", () => {
    const rows = toLisatietoRows(
      entryWithLisatiedot([
        {
          era: 1,
          lisatiedot: [
            {
              koodi: "25",
              osa: "a",
              arvo: "0.3",
              nimi: "Yöjälki löytyi",
              jarjestys: 25,
            },
            {
              koodi: "25",
              osa: "b",
              arvo: "0",
              nimi: "Yöjälki löytyi",
              jarjestys: 26,
            },
            {
              koodi: "57",
              osa: "",
              arvo: "0.8",
              nimi: "Tie ja esteajoa",
              jarjestys: 57,
            },
          ],
        },
        {
          era: 2,
          lisatiedot: [
            {
              koodi: "27",
              osa: "c",
              arvo: "5",
              nimi: "Aika yöjäljellä",
              jarjestys: 29,
            },
          ],
        },
      ]),
      [createEmptyEraDraft(1), createEmptyEraDraft(2)],
    );

    expect(
      rows.find((row) => row.koodi === "25" && row.osa === "a"),
    ).toMatchObject({
      label: "Yöjälki löytyi",
      eraValues: { 1: "0.3", 2: "" },
    });
    expect(
      rows.find((row) => row.koodi === "25" && row.osa === "b"),
    ).toMatchObject({
      eraValues: { 1: "0", 2: "" },
    });
    expect(
      rows.find((row) => row.koodi === "27" && row.osa === "c"),
    ).toMatchObject({
      eraValues: { 1: "", 2: "5" },
    });
    expect(
      rows.find((row) => row.koodi === "57" && row.osa === ""),
    ).toMatchObject({
      group: "ajo",
      inputKind: "decimal",
      eraValues: { 1: "0.8", 2: "" },
    });
  });

  it("keeps existing unknown numeric rows editable as text", () => {
    const rows = toLisatietoRows(
      entryWithLisatiedot([
        {
          era: 1,
          lisatiedot: [
            {
              koodi: "90",
              osa: "legacy",
              arvo: "free value",
              nimi: "Legacy field",
              jarjestys: 900,
            },
          ],
        },
      ]),
      [createEmptyEraDraft(1), createEmptyEraDraft(2)],
    );

    expect(
      rows.find((row) => row.koodi === "90" && row.osa === "legacy"),
    ).toMatchObject({
      group: "unknown",
      label: "Legacy field",
      inputKind: "text",
      eraValues: { 1: "free value", 2: "" },
    });
  });
});
