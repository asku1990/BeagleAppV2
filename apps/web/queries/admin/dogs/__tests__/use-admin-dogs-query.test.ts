import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminDogsQueryKey } from "../query-keys";
import { useAdminDogsQuery } from "../use-admin-dogs-query";

const { useQueryMock, getAdminDogsActionMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getAdminDogsActionMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@/app/actions/admin/dogs/get-admin-dogs", () => ({
  getAdminDogsAction: getAdminDogsActionMock,
}));

describe("useAdminDogsQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getAdminDogsActionMock.mockReset();
  });

  it("uses expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminDogsQuery({ query: "kide", sex: "FEMALE" });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: readonly unknown[];
      staleTime: number;
      refetchOnWindowFocus: boolean;
    };

    expect(options.queryKey).toEqual(
      adminDogsQueryKey({ query: "kide", sex: "FEMALE" }),
    );
    expect(options.staleTime).toBe(30_000);
    expect(options.refetchOnWindowFocus).toBe(true);
  });

  it("returns items and pagination when action succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminDogsActionMock.mockResolvedValue({
      hasError: false,
      data: {
        total: 1,
        totalPages: 1,
        page: 1,
        items: [
          {
            id: "dog_1",
            registrationNo: "FI12345/21",
            name: "Metsapolun Kide",
            sex: "FEMALE",
            birthDate: "2021-04-09T00:00:00.000Z",
            breederName: "Metsapolun",
            ownerNames: ["Tiina Virtanen"],
            sire: null,
            dam: null,
            trialCount: 7,
            showCount: 4,
            ekNo: 5588,
            note: null,
          },
        ],
      },
    });

    useAdminDogsQuery({ query: "kide" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual({
      total: 1,
      totalPages: 1,
      page: 1,
      items: [
        {
          id: "dog_1",
          registrationNo: "FI12345/21",
          name: "Metsapolun Kide",
          sex: "FEMALE",
          birthDate: "2021-04-09T00:00:00.000Z",
          breederName: "Metsapolun",
          ownerNames: ["Tiina Virtanen"],
          sire: null,
          dam: null,
          trialCount: 7,
          showCount: 4,
          ekNo: 5588,
          note: null,
        },
      ],
    });
  });

  it("throws when action returns error", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminDogsActionMock.mockResolvedValue({
      hasError: true,
      data: null,
      errorCode: "INTERNAL_ERROR",
    });

    useAdminDogsQuery({});
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow(
      "Failed to load admin dogs.",
    );
  });
});
