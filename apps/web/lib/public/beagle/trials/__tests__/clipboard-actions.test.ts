import { describe, expect, it, vi } from "vitest";
import {
  copyDogProfileTrialRowsToClipboard,
  copyTrialDetailRowToClipboard,
  copyTrialSearchRowsToClipboard,
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
  no: "N:o",
  registrationNo: "Rek.nro",
  name: "Nimi",
  sex: "Sukupuoli",
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
};

const messages = {
  success: "copy.success",
  error: "copy.error",
  unsupported: "copy.unsupported",
};

describe("trial clipboard actions", () => {
  it("writes search rows to clipboard and shows success toast", async () => {
    const toast = createToastMocks();
    const writeText = vi.fn().mockResolvedValue(undefined);

    const result = await copyTrialSearchRowsToClipboard({
      rows: [
        {
          trialId: "t1",
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

    const result = await copyTrialDetailRowToClipboard({
      row: {
        id: "r1",
        dogId: "d1",
        registrationNo: "FI-1/20",
        name: "Aatu",
        sex: "U",
        weather: "L",
        award: "1",
        classCode: "V",
        rank: "1",
        points: 88.2,
        judge: "Judge A",
        haku: 4,
        hauk: 4,
        yva: 4,
        hlo: 0,
        alo: 0,
        tja: 0,
        pin: 8,
      },
      labels: detailLabels,
      index: 1,
      messages,
      toast,
    });

    expect(result).toBe(false);
    expect(toast.warning).toHaveBeenCalledWith("copy.unsupported");
  });

  it("shows error toast when dog profile clipboard write fails", async () => {
    const toast = createToastMocks();
    const writeText = vi.fn().mockRejectedValue(new Error("boom"));

    const result = await copyDogProfileTrialRowsToClipboard({
      rows: [
        {
          id: "d1",
          trialId: "trial-1",
          place: "Turku",
          date: "2025-06-01",
          weather: "P",
          rank: "1",
          points: 85.5,
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
      ],
      labels: {
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
      columns: {
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
      messages,
      clipboard: { writeText },
      toast,
    });

    expect(result).toBe(false);
    expect(writeText).toHaveBeenCalledWith(
      "N:o\tPaikka\tPäivä\tKeli\tPalkinto\tSija\tPisteet\tTuomari\tHaku\tHaukku\tYVA\tHLO\tALO\tTJA\tPIN\n1\tTurku\t2025-06-01\tP\tVOI\t1\t85.50\tJudge A\t4\t5\t6\t1\t2\t3\t9",
    );
    expect(toast.error).toHaveBeenCalledWith("copy.error");
  });
});
