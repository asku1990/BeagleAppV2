import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { useAdminVirtualPairingSearchQuery } from "../use-admin-virtual-pairing-search-query";

const { useQueryMock, fetchMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  fetchMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

describe("useAdminVirtualPairingSearchQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminVirtualPairingSearchQuery(
      { field: "name", query: "Kide", page: 1, pageSize: 10 },
      true,
    );

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: readonly unknown[];
      staleTime: number;
      refetchOnWindowFocus: boolean;
    };

    expect(options.queryKey).toEqual([
      "admin-dogs",
      "virtual-pairing",
      "search",
      "name",
      "Kide",
      1,
      10,
    ]);
    expect(options.staleTime).toBe(30_000);
    expect(options.refetchOnWindowFocus).toBe(true);
  });

  it("returns data when the api route succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          field: "name",
          query: "Kide",
          total: 1,
          totalPages: 1,
          page: 1,
          isLimited: false,
          candidateLimit: null,
          items: [
            {
              id: "dog_1",
              ekNo: 5588,
              registrationNo: "FI12345/21",
              name: "Metsapolun Kide",
              sex: "N",
            },
          ],
        },
      }),
    });

    useAdminVirtualPairingSearchQuery(
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

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/dogs/virtual-pairing?field=name&query=Kide&page=1&pageSize=10",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
      }),
    );
  });

  it("throws AdminMutationError when the api route returns an error", async () => {
    useQueryMock.mockImplementation((options) => options);
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({
        ok: false,
        error: "Registration number is required.",
        code: "INVALID_REGISTRATION_NO",
      }),
    });

    useAdminVirtualPairingSearchQuery(
      { field: "reg", query: "FI12345/21", page: 1, pageSize: 10 },
      true,
    );
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toEqual(
      expect.objectContaining({
        message: "Registration number is required.",
        errorCode: "INVALID_REGISTRATION_NO",
      }),
    );
  });

  it("throws fallback error when fetch fails", async () => {
    useQueryMock.mockImplementation((options) => options);
    fetchMock.mockRejectedValue(new Error("network down"));

    useAdminVirtualPairingSearchQuery(
      { field: "name", query: "Kide", page: 1, pageSize: 10 },
      true,
    );
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toBeInstanceOf(AdminMutationError);
  });
});
