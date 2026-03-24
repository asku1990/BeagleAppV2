import { describe, expect, it, vi } from "vitest";
import {
  copyDogProfileShowRowsToClipboard,
  copyShowDetailRowToClipboard,
  copyShowSearchRowsToClipboard,
} from "../clipboard";

function createToastMocks() {
  return {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  };
}

const searchLabels = {
  date: "Päivä",
  place: "Paikka",
  judge: "Tuomari",
  dogCount: "Koiria",
};

const detailLabels = {
  registrationNo: "Rek.nro",
  name: "Nimi",
  sex: "Sukupuoli",
  showType: "Tyyppi",
  className: "Kilpailuluokka",
  qualityGrade: "Laatuarvostelu",
  placement: "Sijoitus",
  resultNotes: "PU/PN, Muut merkinnät",
  reviewText: "Arvostelu",
  height: "Korkeus",
  judge: "Tuomari",
  sexMale: "Uros",
  sexFemale: "Narttu",
  sexUnknown: "-",
};

const messages = {
  success: "copy.success",
  error: "copy.error",
  unsupported: "copy.unsupported",
};

describe("show clipboard actions", () => {
  it("writes search rows to clipboard and shows success toast", async () => {
    const toast = createToastMocks();
    const writeText = vi.fn().mockResolvedValue(undefined);

    const result = await copyShowSearchRowsToClipboard({
      rows: [
        {
          showId: "s1",
          eventDate: "2025-06-01",
          eventPlace: "Helsinki",
          judge: "Judge A",
          dogCount: 7,
        },
      ],
      labels: searchLabels,
      messages,
      clipboard: { writeText },
      toast,
    });

    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith(
      "Päivä\tPaikka\tTuomari\tKoiria\n2025-06-01\tHelsinki\tJudge A\t7",
    );
    expect(toast.success).toHaveBeenCalledWith("copy.success");
  });

  it("shows unsupported toast when clipboard is unavailable", async () => {
    const toast = createToastMocks();

    const result = await copyShowSearchRowsToClipboard({
      rows: [
        {
          showId: "s1",
          eventDate: "2025-06-01",
          eventPlace: "Helsinki",
          judge: "Judge A",
          dogCount: 7,
        },
      ],
      labels: searchLabels,
      messages,
      toast,
    });

    expect(result).toBe(false);
    expect(toast.warning).toHaveBeenCalledWith("copy.unsupported");
  });

  it("shows error toast when detail row clipboard write fails", async () => {
    const toast = createToastMocks();
    const writeText = vi.fn().mockRejectedValue(new Error("boom"));

    const result = await copyShowDetailRowToClipboard({
      row: {
        id: "r1",
        dogId: "d1",
        registrationNo: "FI-1/20",
        name: "Aatu",
        sex: "U",
        showType: "Ryhmänäyttely",
        classCode: "JUN",
        qualityGrade: "ERI",
        classPlacement: 1,
        pupn: "PU1",
        awards: ["SA"],
        critiqueText: "Pending later",
        heightCm: 40,
        judge: "Judge A",
      },
      labels: detailLabels,
      messages,
      clipboard: { writeText },
      toast,
    });

    expect(result).toBe(false);
    expect(writeText).toHaveBeenCalledWith(
      "Rek.nro\tNimi\tSukupuoli\tTyyppi\tLaatuarvostelu\tKilpailuluokka\tSijoitus\tPU/PN, Muut merkinnät\tKorkeus\tTuomari\tArvostelu\nFI-1/20\tAatu\tUros\tRyhmänäyttely\tERI\tJUN\t1\tPU1, SA\t40 cm\tJudge A\tPending later",
    );
    expect(toast.error).toHaveBeenCalledWith("copy.error");
  });

  it("copies dog profile rows with visible columns", async () => {
    const toast = createToastMocks();
    const writeText = vi.fn().mockResolvedValue(undefined);

    const result = await copyDogProfileShowRowsToClipboard({
      rows: [
        {
          id: "s1",
          showId: "show-1",
          place: "Helsinki",
          date: "2025-06-01",
          showType: "Ryhmänäyttely",
          classCode: "JUN",
          qualityGrade: "ERI",
          classPlacement: 1,
          pupn: "PU1",
          awards: ["SA"],
          critiqueText: "Pending later",
          judge: "Judge A",
          heightCm: 40,
        },
      ],
      labels: {
        no: "N:o",
        showType: "Tyyppi",
        className: "Kilpailuluokka",
        place: "Paikka",
        date: "Päivä",
        qualityGrade: "Laatuarvostelu",
        placement: "Sijoitus",
        resultNotes: "PU/PN, Muut merkinnät",
        reviewText: "Sanallinen arvostelu",
        height: "Korkeus",
        judge: "Tuomari",
      },
      columns: {
        includeShowType: true,
        includeClassName: true,
        includeQualityGrade: true,
        includeClassPlacement: true,
        includePupn: true,
        includeAwards: true,
        includeReviewText: true,
        includeHeight: true,
        includeJudge: true,
      },
      messages,
      clipboard: { writeText },
      toast,
    });

    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith(
      "N:o\tTyyppi\tPaikka\tPäivä\tLaatuarvostelu\tKilpailuluokka\tSijoitus\tPU/PN, Muut merkinnät\tKorkeus\tTuomari\tSanallinen arvostelu\n1\tRyhmänäyttely\tHelsinki\t2025-06-01\tERI\tJUN\t1\tPU1, SA\t40 cm\tJudge A\tPending later",
    );
    expect(toast.success).toHaveBeenCalledWith("copy.success");
  });
});
