import { describe, expect, it } from "vitest";
import {
  formatTrialDetailRowForClipboard,
  formatTrialDetailRowsForClipboard,
  formatTrialSearchRowsForClipboard,
} from "../clipboard";

const labels = {
  no: "N:o",
  registrationNo: "Rek.nro",
  name: "Nimi",
  sex: "Sukupuoli",
  weather: "Keli",
  award: "Palkinto",
  rank: "Sija",
  points: "Pisteet",
  judge: "Tuomari",
  searchWork: "haku",
  barking: "hauk",
  generalImpression: "yva",
  searchLoosenessPenalty: "hlo",
  chaseLoosenessPenalty: "alo",
  obstacleWork: "tja",
  totalPoints: "pin",
};

describe("formatTrialDetailRowForClipboard", () => {
  it("normalizes legacy award values with class prefix", () => {
    const output = formatTrialDetailRowForClipboard(
      {
        id: "r0",
        dogId: "d0",
        registrationNo: "FI-0/20",
        name: "Pena",
        sex: "U",
        weather: "K",
        award: "1",
        classCode: "V",
        rank: "1",
        points: 80,
        judge: "Judge Z",
        haku: 4,
        hauk: 4,
        yva: 4,
        hlo: 0,
        alo: 0,
        tja: 0,
        pin: 8,
      },
      labels,
      1,
    );

    expect(output.split("\n")[1]).toContain("\tVoi 1\t");
  });

  it("formats one row as tab-separated output with header", () => {
    const output = formatTrialDetailRowForClipboard(
      {
        id: "r1",
        dogId: "d1",
        registrationNo: "FI-1/20",
        name: "Aatu",
        sex: "U",
        weather: "L",
        award: "Voi 1",
        classCode: "V",
        rank: "1",
        points: 88.5,
        judge: "Judge A",
        haku: 5,
        hauk: 4,
        yva: 3,
        hlo: 2,
        alo: 1,
        tja: 0.5,
        pin: 6,
      },
      labels,
      3,
    );

    const lines = output.split("\n");
    expect(lines[0]).toContain("N:o\tRek.nro\tNimi");
    expect(lines[1]).toContain("3\tFI-1/20\tAatu");
    expect(lines[1]).toContain("\t88.5\t");
  });

  it("sanitizes tabs/newlines and normalizes nulls", () => {
    const output = formatTrialDetailRowForClipboard(
      {
        id: "r2",
        dogId: "d2",
        registrationNo: "FI-2/20",
        name: "Be\tlla\n",
        sex: "N",
        weather: null,
        award: null,
        classCode: null,
        rank: null,
        points: null,
        judge: null,
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        tja: null,
        pin: null,
      },
      labels,
      1,
    );

    expect(output.split("\n")[1]).toContain("1\tFI-2/20\tBe lla");
    expect(output.split("\n")[1]).toContain("\t-\t-\t-\t-\t-");
  });
});

describe("formatTrialDetailRowsForClipboard", () => {
  it("formats all rows with one header row", () => {
    const output = formatTrialDetailRowsForClipboard(
      [
        {
          id: "r1",
          dogId: "d1",
          registrationNo: "FI-1/20",
          name: "Aatu",
          sex: "U",
          weather: "L",
          award: "Voi 1",
          classCode: "V",
          rank: "1",
          points: 88.5,
          judge: "Judge A",
          haku: 5,
          hauk: 4,
          yva: 3,
          hlo: 2,
          alo: 1,
          tja: 0.5,
          pin: 6,
        },
        {
          id: "r2",
          dogId: "d2",
          registrationNo: "FI-2/20",
          name: "Bella",
          sex: "N",
          weather: null,
          award: null,
          classCode: null,
          rank: null,
          points: null,
          judge: null,
          haku: null,
          hauk: null,
          yva: null,
          hlo: null,
          alo: null,
          tja: null,
          pin: null,
        },
      ],
      labels,
    );

    const lines = output.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toContain("N:o\tRek.nro\tNimi");
    expect(lines[1]).toContain("1\tFI-1/20\tAatu");
    expect(lines[2]).toContain("2\tFI-2/20\tBella");
  });
});

describe("formatTrialSearchRowsForClipboard", () => {
  it("formats search rows with one header row", () => {
    const output = formatTrialSearchRowsForClipboard(
      [
        {
          trialId: "t1",
          eventDate: "2025-06-01",
          eventPlace: "Helsinki",
          judge: "Judge A",
          dogCount: 7,
        },
        {
          trialId: "t2",
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
});
