import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchLegacyPhase1_5Rows } from "../source";

const { connectLegacyDatabaseMock } = vi.hoisted(() => ({
  connectLegacyDatabaseMock: vi.fn(),
}));

vi.mock("../../internal", () => ({
  connectLegacyDatabase: connectLegacyDatabaseMock,
}));

describe("fetchLegacyPhase1_5Rows", () => {
  beforeEach(() => {
    connectLegacyDatabaseMock.mockReset();
  });

  it("loads REKNO + VALIO rows from bea_apu", async () => {
    const log = vi.fn();
    const connection = {
      query: vi.fn().mockResolvedValue([
        { registrationNo: "FI-1/20", titleCodeRaw: "FI JVA" },
        { registrationNo: "FI-2/20", titleCodeRaw: null },
      ]),
      end: vi.fn().mockResolvedValue(undefined),
    };
    connectLegacyDatabaseMock.mockResolvedValue(connection);

    const result = await fetchLegacyPhase1_5Rows({ log });

    expect(connection.query).toHaveBeenCalledWith(
      expect.stringContaining("FROM bea_apu"),
    );
    expect(result).toEqual([
      { registrationNo: "FI-1/20", titleCodeRaw: "FI JVA" },
      { registrationNo: "FI-2/20", titleCodeRaw: null },
    ]);
    expect(log).toHaveBeenCalledWith(
      "Fetched bea_apu title source rows: total=2, elapsed=0s",
    );
    expect(connection.end).toHaveBeenCalled();
  });
});
