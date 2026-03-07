import { describe, expect, it } from "vitest";
import {
  formatDogProfileTrialRowsForClipboard,
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

describe("formatDogProfileTrialRowsForClipboard", () => {
  it("formats dog profile rows using visible columns", () => {
    const output = formatDogProfileTrialRowsForClipboard(
      [
        {
          id: "t1",
          place: "Helsinki",
          date: "2025-06-01",
          weather: "L",
          className: "VOI",
          rank: "1",
          points: 88.2,
          award: "Voi 1",
          judge: "Judge A",
          haku: 4,
          hauk: 5,
          yva: 6,
          hlo: 1,
          alo: 2,
          tja: 3,
          pin: 9,
        },
        {
          id: "t2",
          place: "Turku",
          date: "2025-06-02",
          weather: null,
          className: null,
          rank: null,
          points: null,
          award: null,
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
      {
        no: "N:o",
        place: "Paikka",
        date: "Päivä",
        weather: "Keli",
        award: "Palkinto",
        rank: "Sija",
        points: "Pisteet",
        judge: "Tuomari",
        searchWork: "Haku",
        barking: "Haukku",
        generalImpression: "YVA",
        searchLoosenessPenalty: "HLO",
        chaseLoosenessPenalty: "ALO",
        obstacleWork: "TJA",
        totalPoints: "PIN",
      },
      {
        includeWeather: true,
        includeAward: true,
        includeRank: true,
        includePoints: true,
        includeJudge: true,
        includeSearchWork: true,
        includeBarking: true,
        includeGeneralImpression: true,
        includeSearchLoosenessPenalty: true,
        includeChaseLoosenessPenalty: true,
        includeObstacleWork: true,
        includeTotalPoints: true,
      },
    );

    const lines = output.split("\n");
    expect(lines[0]).toBe(
      "N:o\tPaikka\tPäivä\tKeli\tPalkinto\tSija\tPisteet\tTuomari\tHaku\tHaukku\tYVA\tHLO\tALO\tTJA\tPIN",
    );
    expect(lines[1]).toBe(
      "1\tHelsinki\t2025-06-01\tL\tVOI\t1\t88.20\tJudge A\t4\t5\t6\t1\t2\t3\t9",
    );
    expect(lines[2]).toBe(
      "2\tTurku\t2025-06-02\t-\t-\t-\t-\t-\t-\t-\t-\t-\t-\t-\t-",
    );
  });

  it("sanitizes tabs/newlines and falls back to award when class is missing", () => {
    const output = formatDogProfileTrialRowsForClipboard(
      [
        {
          id: "t3",
          place: "Tam\tpe\nre",
          date: "2025-06-03",
          weather: null,
          className: null,
          rank: "  ",
          points: 75,
          award: "Avo 2",
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
      {
        no: "N:o",
        place: "Paikka",
        date: "Päivä",
        weather: "Keli",
        award: "Palkinto",
        rank: "Sija",
        points: "Pisteet",
        judge: "Tuomari",
        searchWork: "Haku",
        barking: "Haukku",
        generalImpression: "YVA",
        searchLoosenessPenalty: "HLO",
        chaseLoosenessPenalty: "ALO",
        obstacleWork: "TJA",
        totalPoints: "PIN",
      },
      {
        includeWeather: false,
        includeAward: true,
        includeRank: true,
        includePoints: true,
        includeJudge: false,
        includeSearchWork: false,
        includeBarking: false,
        includeGeneralImpression: false,
        includeSearchLoosenessPenalty: false,
        includeChaseLoosenessPenalty: false,
        includeObstacleWork: false,
        includeTotalPoints: false,
      },
    );

    expect(output.split("\n")[1]).toBe(
      "1\tTam pe re\t2025-06-03\tAvo 2\t-\t75.00",
    );
  });
});
