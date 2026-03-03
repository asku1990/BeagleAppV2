import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminDogParentOptionsQueryKey } from "@/queries/admin/dogs/manage/query-keys";
import { useAdminDogParentOptionsQuery } from "../use-admin-dog-parent-options-query";

const { useQueryMock, getAdminParentOptionsActionMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getAdminParentOptionsActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/app/actions/admin/dogs/lookups/get-admin-parent-options", () => ({
  getAdminParentOptionsAction: getAdminParentOptionsActionMock,
}));

describe("useAdminDogParentOptionsQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getAdminParentOptionsActionMock.mockReset();
  });

  it("uses expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminDogParentOptionsQuery({
      query: " korven ",
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
      adminDogParentOptionsQueryKey("korven", 20),
    );
    expect(options.staleTime).toBe(30_000);
    expect(options.refetchOnWindowFocus).toBe(true);
    expect(options.enabled).toBe(false);
  });

  it("returns options when action succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminParentOptionsActionMock.mockResolvedValue({
      hasError: false,
      data: {
        items: [
          {
            id: "dog_1",
            name: "Korven Aatos",
            sex: "MALE",
            registrationNo: "FI54321/20",
          },
        ],
      },
    });

    useAdminDogParentOptionsQuery({ query: "korven" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual([
      {
        id: "dog_1",
        name: "Korven Aatos",
        sex: "MALE",
        registrationNo: "FI54321/20",
      },
    ]);
  });

  it("throws when action returns error", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminParentOptionsActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "INTERNAL_ERROR",
    });

    useAdminDogParentOptionsQuery({ query: "korven" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow(
      "Failed to load parent options.",
    );
  });
});
