import { describe, expect, it } from "vitest";
import {
  formatDogProfileShowRowsForClipboard,
  formatShowDetailRowForClipboard,
  formatShowDetailRowsForClipboard,
  formatShowSearchRowsForClipboard,
} from "../clipboard";

const detailLabels = {
  registrationNo: "Rek.nro",
  name: "Nimi",
  sex: "Sukupuoli",
  showType: "Tyyppi",
  className: "Kilpailuluokka",
  qualityGrade: "Laatuarvostelu",
  placement: "Sijoitus",
  pupn: "PU/PN",
  awards: "Muut merkinnät",
  reviewText: "Arvostelu",
  height: "Korkeus",
  judge: "Tuomari",
  sexMale: "Uros",
  sexFemale: "Narttu",
  sexUnknown: "-",
};

describe("formatShowSearchRowsForClipboard", () => {
  it("formats search rows with one header row", () => {
    const output = formatShowSearchRowsForClipboard(
      [
        {
          showId: "s1",
          eventDate: "2025-06-01",
          eventPlace: "Helsinki",
          judge: "Judge A",
          dogCount: 7,
        },
        {
          showId: "s2",
          eventDate: "2025-05-01",
          eventPlace: "Turku",
          judge: null,
          dogCount: 3,
        },
      ],
      {
        date: "Päivä",
        place: "Paikka",
        judge: "Tuomari",
        dogCount: "Koiria",
      },
    );

    const lines = output.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("Päivä\tPaikka\tTuomari\tKoiria");
    expect(lines[1]).toBe("2025-06-01\tHelsinki\tJudge A\t7");
    expect(lines[2]).toBe("2025-05-01\tTurku\t-\t3");
  });

  it("sanitizes tabs/newlines and normalizes nulls", () => {
    const output = formatShowSearchRowsForClipboard(
      [
        {
          showId: "s1",
          eventDate: "2025-06-01",
          eventPlace: "Hel\tsin\nki",
          judge: null,
          dogCount: 7,
        },
      ],
      {
        date: "Päivä",
        place: "Paikka",
        judge: "Tuomari",
        dogCount: "Koiria",
      },
    );

    expect(output.split("\n")[1]).toBe("2025-06-01\tHel sin ki\t-\t7");
  });
});

describe("formatShowDetailRowForClipboard", () => {
  it("formats one row as tab-separated output with header", () => {
    const output = formatShowDetailRowForClipboard(
      {
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
        critiqueText: "Very good",
        heightCm: 40,
        judge: "Judge A",
      },
      detailLabels,
    );

    const lines = output.split("\n");
    expect(lines[0]).toBe(
      "Rek.nro\tNimi\tSukupuoli\tTyyppi\tKilpailuluokka\tLaatuarvostelu\tSijoitus\tPU/PN\tMuut merkinnät\tArvostelu\tKorkeus\tTuomari",
    );
    expect(lines[1]).toBe(
      "FI-1/20\tAatu\tUros\tRyhmänäyttely\tJUN\tERI\t1\tPU1\tSA\tVery good\t40 cm\tJudge A",
    );
  });

  it("sanitizes tabs/newlines and normalizes nulls", () => {
    const output = formatShowDetailRowForClipboard(
      {
        id: "r2",
        dogId: "d2",
        registrationNo: "FI-2/20",
        name: "Bel\tla\n",
        sex: "-",
        showType: null,
        classCode: null,
        qualityGrade: null,
        classPlacement: null,
        pupn: null,
        awards: [],
        critiqueText: null,
        heightCm: null,
        judge: null,
      },
      detailLabels,
    );

    expect(output.split("\n")[1]).toBe(
      "FI-2/20\tBel la\t-\t-\t-\t-\t-\t-\t-\t-\t-\t-",
    );
  });
});

describe("formatShowDetailRowsForClipboard", () => {
  it("formats all rows with one header row and stable order", () => {
    const output = formatShowDetailRowsForClipboard(
      [
        {
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
          critiqueText: "Review A",
          heightCm: 40,
          judge: "Judge A",
        },
        {
          id: "r2",
          dogId: "d2",
          registrationNo: "FI-2/20",
          name: "Bella",
          sex: "N",
          showType: null,
          classCode: null,
          qualityGrade: null,
          classPlacement: null,
          pupn: null,
          awards: [],
          critiqueText: "Pending later",
          heightCm: null,
          judge: null,
        },
      ],
      detailLabels,
    );

    const lines = output.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe(
      "FI-1/20\tAatu\tUros\tRyhmänäyttely\tJUN\tERI\t1\tPU1\tSA\tReview A\t40 cm\tJudge A",
    );
    expect(lines[2]).toBe(
      "FI-2/20\tBella\tNarttu\t-\t-\t-\t-\t-\t-\tPending later\t-\t-",
    );
  });
});

describe("formatDogProfileShowRowsForClipboard", () => {
  it("formats dog profile rows with visible columns", () => {
    const output = formatDogProfileShowRowsForClipboard(
      [
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
          critiqueText: "Excellent",
          judge: "Judge A",
          heightCm: 40,
        },
        {
          id: "s2",
          showId: "show-2",
          place: "Turku",
          date: "2025-05-01",
          showType: null,
          classCode: null,
          qualityGrade: null,
          classPlacement: null,
          pupn: null,
          awards: [],
          critiqueText: null,
          judge: null,
          heightCm: null,
        },
      ],
      {
        no: "N:o",
        showType: "Tyyppi",
        className: "Kilpailuluokka",
        place: "Paikka",
        date: "Päivä",
        qualityGrade: "Laatuarvostelu",
        placement: "Sijoitus",
        pupn: "PU/PN",
        awards: "Muut merkinnät",
        reviewText: "Sanallinen arvostelu",
        height: "Korkeus",
        judge: "Tuomari",
      },
      {
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
    );

    const lines = output.split("\n");
    expect(lines[0]).toBe(
      "N:o\tTyyppi\tPaikka\tPäivä\tKilpailuluokka\tLaatuarvostelu\tSijoitus\tPU/PN\tMuut merkinnät\tKorkeus\tTuomari\tSanallinen arvostelu",
    );
    expect(lines[1]).toBe(
      "1\tRyhmänäyttely\tHelsinki\t2025-06-01\tJUN\tERI\t1\tPU1\tSA\t40 cm\tJudge A\tExcellent",
    );
    expect(lines[2]).toBe("2\t-\tTurku\t2025-05-01\t-\t-\t-\t-\t-\t-\t-\t-");
  });

  it("sanitizes tabs/newlines", () => {
    const output = formatDogProfileShowRowsForClipboard(
      [
        {
          id: "s3",
          showId: "show-3",
          place: "Tam\tpe\nre",
          date: "2025-06-03",
          showType: null,
          classCode: null,
          qualityGrade: null,
          classPlacement: null,
          pupn: null,
          awards: [],
          critiqueText: null,
          judge: null,
          heightCm: null,
        },
      ],
      {
        no: "N:o",
        showType: "Tyyppi",
        className: "Kilpailuluokka",
        place: "Paikka",
        date: "Päivä",
        qualityGrade: "Laatuarvostelu",
        placement: "Sijoitus",
        pupn: "PU/PN",
        awards: "Muut merkinnät",
        reviewText: "Sanallinen arvostelu",
        height: "Korkeus",
        judge: "Tuomari",
      },
      {
        includeShowType: false,
        includeClassName: false,
        includeQualityGrade: false,
        includeClassPlacement: false,
        includePupn: false,
        includeAwards: false,
        includeReviewText: false,
        includeHeight: false,
        includeJudge: false,
      },
    );

    expect(output.split("\n")[1]).toBe("1\tTam pe re\t2025-06-03");
  });
});
