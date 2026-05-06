import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchLegacyTrialMirrorRows } from "../source";

const { connectLegacyDatabaseMock } = vi.hoisted(() => ({
  connectLegacyDatabaseMock: vi.fn(),
}));

vi.mock("../../internal", () => ({
  connectLegacyDatabase: connectLegacyDatabaseMock,
}));

describe("fetchLegacyTrialMirrorRows", () => {
  beforeEach(() => {
    connectLegacyDatabaseMock.mockReset();
  });

  it("loads mirror rows with raw MUOKATTU strings and payload hashes", async () => {
    const log = vi.fn();
    const connection = {
      query: vi.fn((sql: string) => {
        if (sql.includes("FROM `akoeall`")) {
          return Promise.resolve([
            {
              REKNO: "FI1/24",
              TAPPA: "Oulu",
              TAPPV: "20240101",
              KENNELPIIRI: "Pohjois-Pohjanmaa",
              KENNELPIIRINRO: "11",
              KE: "P",
              LK: null,
              PA: "1",
              PISTE: "60.50",
              SIJA: "1|1",
              HAKU: "6.50",
              HAUK: "7.00",
              YVA: "8.00",
              HLO: "0.00",
              ALO: "0.00",
              TJA: null,
              PIN: null,
              TUOM1: "Judge",
              MUOKATTU: "2024-01-01 12:00:00",
              VARA: "NUL",
            },
          ]);
        }

        return Promise.resolve([
          {
            REKNO: "FI1/24",
            TAPPA: "Oulu",
            TAPPV: "20240101",
            ERA: 1,
            ALKOI: "08:00",
            HAKUMIN: 10,
            AJOMIN: 20,
            HAKU: "6.50",
            HAUK: "7.00",
            YVA: "8.00",
            HLO: "0.00",
            ALO: "0.00",
            TJA: null,
            PIN: null,
            LT11: "x",
            LT12: null,
            LT13: null,
            LT14: null,
            LT15: null,
            LT16: null,
            LT17: null,
            LT18: null,
            LT20: null,
            LT21: null,
            LT22: null,
            LT30: null,
            LT31: null,
            LT32: null,
            LT33: null,
            LT34: null,
            LT35: null,
            LT36: null,
            LT40: null,
            LT41: null,
            LT42: null,
            LT43: null,
            LT44: null,
            LT50: null,
            LT51: null,
            LT52: null,
            LT53: null,
            LT54: null,
            LT55: null,
            LT56: null,
            LT60: null,
            LT61: null,
            LT62: null,
            LT63: null,
            LT64: null,
            LT65: null,
            LT66: null,
            LT71: null,
            LT72: null,
            LT73: null,
            LT74: null,
            LT75: null,
            LT76: null,
            LT77: null,
            LT78: null,
            LT79: null,
            LT80: null,
            LT81: null,
            VIITE: null,
            MUOKATTU: "0000-00-00 00:00:00",
          },
        ]);
      }),
      end: vi.fn().mockResolvedValue(undefined),
    };
    connectLegacyDatabaseMock.mockResolvedValue(connection);

    const result = await fetchLegacyTrialMirrorRows({ log });

    expect(result.akoeall).toHaveLength(1);
    expect(result.akoeall[0]).toMatchObject({
      rekno: "FI1/24",
      muokattuRaw: "2024-01-01 12:00:00",
    });
    expect(result.akoeall[0]?.rawPayloadJson).toContain('"REKNO":"FI1/24"');
    expect(result.akoeall[0]?.sourceHash).toHaveLength(64);
    expect(result.bealt3[0]).toMatchObject({
      rekno: "FI1/24",
      alkoi: "08:00",
      muokattuRaw: "0000-00-00 00:00:00",
    });
    expect(connection.end).toHaveBeenCalledTimes(6);
  });
});
