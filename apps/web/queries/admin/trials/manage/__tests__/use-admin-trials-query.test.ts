import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminTrialsQueryKey } from "../query-keys";
import { useAdminTrialsQuery } from "../use-admin-trials-query";

const { useQueryMock, listAdminTrialsMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  listAdminTrialsMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@beagle/api-client", () => ({
  createAdminTrialsApiClient: () => ({
    listAdminTrials: listAdminTrialsMock,
  }),
}));

describe("useAdminTrialsQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    listAdminTrialsMock.mockReset();
  });

  it("uses the expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminTrialsQuery({
      query: "rex",
      page: 2,
      pageSize: 10,
      sort: "date-asc",
    });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: unknown[];
      staleTime: number;
      refetchOnWindowFocus: boolean;
    };

    expect(options.queryKey).toEqual(
      adminTrialsQueryKey({
        query: "rex",
        page: 2,
        pageSize: 10,
        sort: "date-asc",
      }),
    );
    expect(options.staleTime).toBe(30_000);
    expect(options.refetchOnWindowFocus).toBe(true);
  });

  it("returns data when action succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    listAdminTrialsMock.mockResolvedValue({
      ok: true,
      data: {
        total: 1,
        totalPages: 1,
        page: 1,
        items: [
          {
            trialId: "trial-1",
            dogName: "Rex",
            registrationNo: "FI123",
            sourceKey: "src-1",
            eventDate: "2026-04-14",
            eventPlace: "Helsinki",
            judge: "Judge",
            piste: 98.5,
            pa: "1",
            sija: "2",
          },
        ],
      },
    });

    useAdminTrialsQuery({ query: "rex" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual({
      total: 1,
      totalPages: 1,
      page: 1,
      items: [
        {
          trialId: "trial-1",
          dogName: "Rex",
          registrationNo: "FI123",
          sourceKey: "src-1",
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          judge: "Judge",
          piste: 98.5,
          pa: "1",
          sija: "2",
        },
      ],
    });
  });

  it("throws when action returns error", async () => {
    useQueryMock.mockImplementation((options) => options);
    listAdminTrialsMock.mockResolvedValue({
      ok: false,
      error: "Failed to load admin trials.",
      code: "INTERNAL_ERROR",
    });

    useAdminTrialsQuery({});
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow(
      "Failed to load admin trials.",
    );
  });
});
