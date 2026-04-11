import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchLegacyShowRows } from "../source";

const { connectLegacyDatabaseMock } = vi.hoisted(() => ({
  connectLegacyDatabaseMock: vi.fn(),
}));

vi.mock("../../internal", () => ({
  connectLegacyDatabase: connectLegacyDatabaseMock,
}));

type RawLegacyRow = {
  registrationNo: string;
  eventDateRaw: string | null;
  eventPlace: string | null;
  resultText: string | null;
  heightText: string | null;
  judge: string | null;
  legacyFlag: string | null;
  dogName: string | null;
  sourceTable: "nay9599" | "beanay" | "nay9599_rd_ud";
};

function createConnection(baseRows: RawLegacyRow[]) {
  const query = vi
    .fn()
    .mockResolvedValueOnce([]) // tableExists(nay9599_rd_ud) => false
    .mockResolvedValueOnce(baseRows) // baseRows from nay9599 + beanay union query
    .mockResolvedValueOnce([]); // critiqueRows from beanay_text
  return {
    query,
    end: vi.fn().mockResolvedValue(undefined),
  };
}

describe("fetchLegacyShowRows", () => {
  beforeEach(() => {
    connectLegacyDatabaseMock.mockReset();
  });

  it("resolves equal-priority collisions deterministically", async () => {
    const log = vi.fn();
    const zetaFirst: RawLegacyRow = {
      registrationNo: "FI-123/20",
      eventDateRaw: "20240101",
      eventPlace: "Helsinki",
      resultText: "AVO1",
      heightText: "38",
      judge: "Zeta Judge",
      legacyFlag: null,
      dogName: "Dog Alpha",
      sourceTable: "nay9599",
    };
    const alphaSecond: RawLegacyRow = {
      ...zetaFirst,
      judge: "Alpha Judge",
    };

    connectLegacyDatabaseMock
      .mockResolvedValueOnce(createConnection([zetaFirst, alphaSecond]))
      .mockResolvedValueOnce(createConnection([alphaSecond, zetaFirst]));

    const first = await fetchLegacyShowRows({ log });
    const second = await fetchLegacyShowRows({ log });

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
    expect(first[0]?.judge).toBe("Alpha Judge");
    expect(second[0]?.judge).toBe("Alpha Judge");
    expect(log).toHaveBeenCalledWith(
      "Fetched legacy show source rows: total=1, mergedKeys=1, passthroughRowsWithoutMergeKey=0, elapsed=0s",
    );
  });
});
