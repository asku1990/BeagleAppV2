import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchLegacyTrialRows } from "../source";

const { connectLegacyDatabaseMock } = vi.hoisted(() => ({
  connectLegacyDatabaseMock: vi.fn(),
}));

vi.mock("../../internal", () => ({
  connectLegacyDatabase: connectLegacyDatabaseMock,
}));

describe("fetchLegacyTrialRows", () => {
  beforeEach(() => {
    connectLegacyDatabaseMock.mockReset();
  });

  it("logs akoeall source rows as raw input rows", async () => {
    const log = vi.fn();
    const connection = {
      query: vi
        .fn()
        .mockResolvedValue([
          { registrationNo: "FI-1/20" },
          { registrationNo: "FI-2/20" },
        ]),
      end: vi.fn().mockResolvedValue(undefined),
    };
    connectLegacyDatabaseMock.mockResolvedValue(connection);

    const result = await fetchLegacyTrialRows({ log });

    expect(result).toEqual([
      { registrationNo: "FI-1/20" },
      { registrationNo: "FI-2/20" },
    ]);
    expect(log).toHaveBeenCalledWith(
      "Fetched akoeall source rows: total=2, elapsed=0s",
    );
    expect(connection.end).toHaveBeenCalled();
  });
});
