import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminDogBreederOptionsQueryKey } from "../query-keys";
import { useAdminDogBreederOptionsQuery } from "../use-admin-dog-breeder-options-query";

const { useQueryMock, getAdminBreederOptionsActionMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getAdminBreederOptionsActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/app/actions/admin/dogs/get-admin-breeder-options", () => ({
  getAdminBreederOptionsAction: getAdminBreederOptionsActionMock,
}));

describe("useAdminDogBreederOptionsQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getAdminBreederOptionsActionMock.mockReset();
  });

  it("uses expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminDogBreederOptionsQuery({
      query: " metsa ",
      limit: 20,
      enabled: false,
    });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: readonly unknown[];
      staleTime: number;
      refetchOnWindowFocus: boolean;
      enabled: boolean;
    };

    expect(options.queryKey).toEqual(
      adminDogBreederOptionsQueryKey("metsa", 20),
    );
    expect(options.staleTime).toBe(30_000);
    expect(options.refetchOnWindowFocus).toBe(true);
    expect(options.enabled).toBe(false);
  });

  it("returns options when action succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminBreederOptionsActionMock.mockResolvedValue({
      hasError: false,
      data: {
        items: [{ id: "br_1", name: "Metsapolun" }],
      },
    });

    useAdminDogBreederOptionsQuery({ query: "metsa" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual([
      { id: "br_1", name: "Metsapolun" },
    ]);
  });

  it("throws when action returns error", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminBreederOptionsActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "INTERNAL_ERROR",
    });

    useAdminDogBreederOptionsQuery({ query: "metsa" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow(
      "Failed to load breeder options.",
    );
  });
});
