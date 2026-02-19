import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBeagleNewestQuery } from "../use-beagle-newest-query";

const { useQueryMock, getNewestDogsActionMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getNewestDogsActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/app/actions/beagle-search/get-newest-dogs", () => ({
  getNewestDogsAction: getNewestDogsActionMock,
}));

describe("useBeagleNewestQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getNewestDogsActionMock.mockReset();
  });

  it("uses default limit and query options", () => {
    useQueryMock.mockImplementation((options) => options);

    useBeagleNewestQuery();

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: unknown[];
      staleTime: number;
      refetchInterval: number;
      refetchOnWindowFocus: boolean;
    };

    expect(options.queryKey).toEqual(["beagle-newest", 5]);
    expect(options.staleTime).toBe(300_000);
    expect(options.refetchInterval).toBe(300_000);
    expect(options.refetchOnWindowFocus).toBe(true);
  });

  it("returns newest items when action succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    getNewestDogsActionMock.mockResolvedValue({
      hasError: false,
      data: {
        items: [
          {
            id: "dog_1",
            name: "Alpha",
            ekNo: 1,
            sex: "male",
            birthDate: null,
            sireName: null,
            damName: null,
            registrationNos: ["FI-1/24"],
            trialResultCount: 0,
            showResultCount: 0,
            createdAt: "2026-02-19T10:00:00.000Z",
          },
        ],
      },
    });

    useBeagleNewestQuery(10);
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual([
      {
        id: "dog_1",
        name: "Alpha",
        ekNo: 1,
        sex: "male",
        birthDate: null,
        sireName: null,
        damName: null,
        registrationNos: ["FI-1/24"],
        trialResultCount: 0,
        showResultCount: 0,
        createdAt: "2026-02-19T10:00:00.000Z",
      },
    ]);
    expect(getNewestDogsActionMock).toHaveBeenCalledWith({ limit: 10 });
  });

  it("throws fallback error when action fails without message", async () => {
    useQueryMock.mockImplementation((options) => options);
    getNewestDogsActionMock.mockResolvedValue({
      hasError: true,
      data: null,
    });

    useBeagleNewestQuery(3);
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow(
      "Failed to load newest beagles.",
    );
  });
});
