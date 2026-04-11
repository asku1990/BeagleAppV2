import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchLegacyPhase1Rows } from "../source";

const { connectLegacyDatabaseMock } = vi.hoisted(() => ({
  connectLegacyDatabaseMock: vi.fn(),
}));

vi.mock("../../internal", () => ({
  connectLegacyDatabase: connectLegacyDatabaseMock,
}));

describe("fetchLegacyPhase1Rows", () => {
  beforeEach(() => {
    connectLegacyDatabaseMock.mockReset();
  });

  it("logs raw bea_apu rows and the subset with EKNO", async () => {
    const log = vi.fn();
    const connection = {
      query: vi.fn().mockResolvedValue([
        { registrationNo: "FI-1/20", ekNo: 123 },
        { registrationNo: "FI-2/20", ekNo: null },
      ]),
      end: vi.fn().mockResolvedValue(undefined),
    };
    connectLegacyDatabaseMock.mockResolvedValue(connection);

    const result = await fetchLegacyPhase1Rows({ log });

    expect(result.eks).toEqual([
      { registrationNo: "FI-1/20", ekNo: 123 },
      { registrationNo: "FI-2/20", ekNo: null },
    ]);
    expect(log).toHaveBeenCalledWith(
      "Fetched bea_apu source rows: total=2, withEkNo=1, elapsed=0s",
    );
    expect(connection.end).toHaveBeenCalled();
  });
});
