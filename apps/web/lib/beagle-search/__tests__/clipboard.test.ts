import { describe, expect, it } from "vitest";
import { formatBeagleRowsForClipboard } from "../clipboard";

const labels = {
  ek: "EK-numero",
  registration: "Rekisterinumero",
  registrationAll: "Muut rekisterinumerot",
  name: "Nimi",
  sex: "Sukupuoli",
  birthDate: "Syntymäaika",
  sire: "Isä",
  dam: "Emä",
  trials: "Kokeet (lkm)",
  shows: "Näyttelyt (lkm)",
  sexMale: "Uros",
  sexFemale: "Narttu",
};

describe("formatBeagleRowsForClipboard", () => {
  it("formats rows into tab-separated output with header", () => {
    const output = formatBeagleRowsForClipboard(
      [
        {
          id: "d1",
          ekNo: 123,
          registrationNo: "FI-1/24",
          registrationNos: ["FI-1/24", "SE-1/24"],
          createdAt: "2026-01-01T00:00:00.000Z",
          sex: "U",
          name: "Alpha",
          birthDate: "2020-05-12T00:00:00.000Z",
          sire: "Sire One",
          dam: "Dam One",
          trialCount: 2,
          showCount: 1,
        },
      ],
      labels,
    );

    const lines = output.split("\n");
    expect(lines[0]).toBe(
      "Rekisterinumero\tMuut rekisterinumerot\tEK-numero\tSukupuoli\tNimi\tSyntymäaika\tIsä\tEmä\tKokeet (lkm)\tNäyttelyt (lkm)",
    );
    expect(lines[1]).toBe(
      "FI-1/24\tSE-1/24\t123\tUros\tAlpha\t2020-05-12\tSire One\tDam One\t2\t1",
    );
  });

  it("sanitizes tabs/newlines and maps unknown values safely", () => {
    const output = formatBeagleRowsForClipboard(
      [
        {
          id: "d2",
          ekNo: null,
          registrationNo: "FI-2/24",
          registrationNos: ["FI-2/24"],
          createdAt: "2026-01-01T00:00:00.000Z",
          sex: "-",
          name: "Beta\tDog",
          birthDate: null,
          sire: "Sire\nTwo",
          dam: "Dam\tTwo",
          trialCount: 0,
          showCount: 0,
        },
      ],
      labels,
    );

    expect(output.split("\n")[1]).toBe(
      "FI-2/24\t-\t-\t-\tBeta Dog\t-\tSire Two\tDam Two\t0\t0",
    );
  });
});
