import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBeagleDogTrialsQuery } from "../use-beagle-dog-trials-query";
import { beagleDogTrialsQueryKey } from "../dog-trials-query-keys";

const { useQueryMock, fetchMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  fetchMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

describe("useBeagleDogTrialsQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("builds the trials query key and fetches the api route", () => {
    useQueryMock.mockImplementation((options) => options);
    useBeagleDogTrialsQuery(" dog_1 ");

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: unknown[];
      enabled: boolean;
    };

    expect(options.queryKey).toEqual(beagleDogTrialsQueryKey("dog_1"));
    expect(options.enabled).toBe(true);
  });

  it("fetches the route and returns the payload", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
        data: {
          id: "dog_1",
          name: "Ajometsan Aada",
          registrationNo: "FI-11/24",
          trials: [],
          summary: {
            allTrials: [],
            drivenTrials: [],
            noPrize: [],
            prizePlacements: [],
            interrupted: [],
          },
          eraStats: null,
        },
      }),
    });
    useQueryMock.mockImplementation((options) => options);

    useBeagleDogTrialsQuery("dog_1");
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual({
      id: "dog_1",
      name: "Ajometsan Aada",
      registrationNo: "FI-11/24",
      trials: [],
      summary: {
        allTrials: [],
        drivenTrials: [],
        noPrize: [],
        prizePlacements: [],
        interrupted: [],
      },
      eraStats: null,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/beagle/dogs/dog_1/trials",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
      }),
    );
  });

  it("throws a fallback error when fetch rejects", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    useQueryMock.mockImplementation((options) => options);

    useBeagleDogTrialsQuery("dog_1");
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toMatchObject({
      message: "Failed to load dog trials.",
      status: 500,
    });
  });

  it("throws the api error message when the payload is not ok", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({
        ok: false,
        error: "Dog profile not found.",
      }),
    });
    useQueryMock.mockImplementation((options) => options);

    useBeagleDogTrialsQuery("dog_1");
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toMatchObject({
      message: "Dog profile not found.",
      status: 404,
    });
  });

  it("disables the query for blank ids", () => {
    useQueryMock.mockImplementation((options) => options);

    useBeagleDogTrialsQuery("   ");

    const options = useQueryMock.mock.calls[0]?.[0] as {
      enabled: boolean;
    };

    expect(options.enabled).toBe(false);
  });
});
