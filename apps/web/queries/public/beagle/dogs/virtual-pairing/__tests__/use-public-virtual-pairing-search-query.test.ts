import { beforeEach, describe, expect, it, vi } from "vitest";
import { publicVirtualPairingSearchQueryKey } from "../query-keys";
import { usePublicVirtualPairingSearchQuery } from "../use-public-virtual-pairing-search-query";

const { useQueryMock, searchPublicVirtualPairingMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  searchPublicVirtualPairingMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/lib/api-client", () => ({
  apiClient: {
    searchPublicVirtualPairing: searchPublicVirtualPairingMock,
  },
}));

describe("usePublicVirtualPairingSearchQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    searchPublicVirtualPairingMock.mockReset();
  });

  it("uses expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    usePublicVirtualPairingSearchQuery(
      { field: "name", query: "Kide", page: 1, pageSize: 10 },
      true,
    );

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: readonly unknown[];
      staleTime: number;
      refetchOnWindowFocus: boolean;
    };

    expect(options.queryKey).toEqual(
      publicVirtualPairingSearchQueryKey({
        field: "name",
        query: "Kide",
        page: 1,
        pageSize: 10,
      }),
    );
    expect(options.staleTime).toBe(30_000);
    expect(options.refetchOnWindowFocus).toBe(true);
  });

  it("returns data when the api client succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    searchPublicVirtualPairingMock.mockResolvedValue({
      ok: true,
      data: {
        field: "name",
        query: "Kide",
        total: 1,
        totalPages: 1,
        page: 1,
        isLimited: false,
        candidateLimit: null,
        items: [],
      },
    });

    usePublicVirtualPairingSearchQuery(
      { field: "name", query: "Kide", page: 1, pageSize: 10 },
      true,
    );
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toMatchObject({
      field: "name",
      total: 1,
    });

    expect(searchPublicVirtualPairingMock).toHaveBeenCalledWith({
      field: "name",
      query: "Kide",
      page: 1,
      pageSize: 10,
    });
  });

  it("throws route error text when the api client returns an error", async () => {
    useQueryMock.mockImplementation((options) => options);
    searchPublicVirtualPairingMock.mockResolvedValue({
      ok: false,
      error: "Registration number is required.",
      code: "INVALID_REGISTRATION_NO",
    });

    usePublicVirtualPairingSearchQuery(
      { field: "reg", query: "FI12345/21", page: 1, pageSize: 10 },
      true,
    );
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow(
      "Registration number is required.",
    );
  });

  it("throws fallback error when api client returns a blank error", async () => {
    useQueryMock.mockImplementation((options) => options);
    searchPublicVirtualPairingMock.mockResolvedValue({
      ok: false,
      error: "",
    });

    usePublicVirtualPairingSearchQuery(
      { field: "name", query: "Kide", page: 1, pageSize: 10 },
      true,
    );
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow(
      "Failed to load virtual pairing search results.",
    );
  });
});
