import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminDogOwnerOptionsQueryKey } from "../query-keys";
import { useAdminDogOwnerOptionsQuery } from "../use-admin-dog-owner-options-query";

const { useQueryMock, getAdminOwnerOptionsActionMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getAdminOwnerOptionsActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/app/actions/admin/dogs/get-admin-owner-options", () => ({
  getAdminOwnerOptionsAction: getAdminOwnerOptionsActionMock,
}));

describe("useAdminDogOwnerOptionsQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getAdminOwnerOptionsActionMock.mockReset();
  });

  it("uses expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminDogOwnerOptionsQuery({ query: " esa ", limit: 20, enabled: false });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: readonly unknown[];
      staleTime: number;
      refetchOnWindowFocus: boolean;
      enabled: boolean;
    };

    expect(options.queryKey).toEqual(adminDogOwnerOptionsQueryKey("esa", 20));
    expect(options.staleTime).toBe(30_000);
    expect(options.refetchOnWindowFocus).toBe(true);
    expect(options.enabled).toBe(false);
  });

  it("returns options when action succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminOwnerOptionsActionMock.mockResolvedValue({
      hasError: false,
      data: {
        items: [{ id: "ow_1", name: "Aalto Esa" }],
      },
    });

    useAdminDogOwnerOptionsQuery({ query: "esa" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual([
      { id: "ow_1", name: "Aalto Esa" },
    ]);
  });

  it("throws when action returns error", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminOwnerOptionsActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "INTERNAL_ERROR",
    });

    useAdminDogOwnerOptionsQuery({ query: "esa" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow(
      "Failed to load owner options.",
    );
  });
});
