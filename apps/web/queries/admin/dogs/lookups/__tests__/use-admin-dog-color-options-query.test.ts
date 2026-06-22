import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminDogColorOptionsQueryKey } from "@/queries/admin/dogs/manage/query-keys";
import { useAdminDogColorOptionsQuery } from "../use-admin-dog-color-options-query";

const { useQueryMock, getAdminDogColorOptionsActionMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getAdminDogColorOptionsActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/app/actions/admin/dogs/lookups/get-admin-dog-color-options", () => ({
  getAdminDogColorOptionsAction: getAdminDogColorOptionsActionMock,
}));

describe("useAdminDogColorOptionsQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getAdminDogColorOptionsActionMock.mockReset();
  });

  it("uses expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminDogColorOptionsQuery(false);

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: readonly unknown[];
      staleTime: number;
      refetchOnWindowFocus: boolean;
      enabled: boolean;
    };

    expect(options.queryKey).toEqual(adminDogColorOptionsQueryKey());
    expect(options.staleTime).toBe(300_000);
    expect(options.refetchOnWindowFocus).toBe(true);
    expect(options.enabled).toBe(false);
  });

  it("returns options when action succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminDogColorOptionsActionMock.mockResolvedValue({
      hasError: false,
      data: {
        items: [{ id: "dc_1", name: "Musta" }],
      },
    });

    useAdminDogColorOptionsQuery();
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual([
      { id: "dc_1", name: "Musta" },
    ]);
  });

  it("throws when action returns error", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminDogColorOptionsActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "INTERNAL_ERROR",
    });

    useAdminDogColorOptionsQuery();
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow(
      "Failed to load dog color options.",
    );
  });
});
