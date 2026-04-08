import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminShowEventsQueryKey } from "../query-keys";
import { useAdminShowEventsQuery } from "../use-admin-show-events-query";

const { useQueryMock, listAdminShowEventsMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  listAdminShowEventsMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@beagle/api-client", () => ({
  createAdminShowsApiClient: () => ({
    listAdminShowEvents: listAdminShowEventsMock,
  }),
}));

describe("useAdminShowEventsQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    listAdminShowEventsMock.mockReset();
  });

  it("uses expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminShowEventsQuery({
      query: "beagle",
      page: 2,
      pageSize: 10,
      sort: "date-asc",
    });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: readonly unknown[];
      staleTime: number;
      refetchOnWindowFocus: boolean;
    };

    expect(options.queryKey).toEqual(
      adminShowEventsQueryKey({
        query: "beagle",
        page: 2,
        pageSize: 10,
        sort: "date-asc",
      }),
    );
    expect(options.staleTime).toBe(30_000);
    expect(options.refetchOnWindowFocus).toBe(true);
  });

  it("returns data when api client succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    listAdminShowEventsMock.mockResolvedValue({
      ok: true,
      data: {
        total: 1,
        totalPages: 1,
        page: 1,
        items: [
          {
            showId: "show-1",
            eventDate: "2025-06-01",
            eventPlace: "Helsinki",
            eventCity: "Helsinki",
            eventName: "Summer Show",
            eventType: "A",
            organizer: "Beagle Club",
            judge: "Judge",
            dogCount: 1,
          },
        ],
      },
    });

    useAdminShowEventsQuery({ query: "beagle" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual({
      total: 1,
      totalPages: 1,
      page: 1,
      items: [
        {
          showId: "show-1",
          eventDate: "2025-06-01",
          eventPlace: "Helsinki",
          eventCity: "Helsinki",
          eventName: "Summer Show",
          eventType: "A",
          organizer: "Beagle Club",
          judge: "Judge",
          dogCount: 1,
        },
      ],
    });
  });

  it("throws when api client returns error", async () => {
    useQueryMock.mockImplementation((options) => options);
    listAdminShowEventsMock.mockResolvedValue({
      ok: false,
      error: "Forbidden",
      code: "FORBIDDEN",
    });

    useAdminShowEventsQuery({});
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toMatchObject({
      message: "Admin access required.",
      errorCode: "FORBIDDEN",
    });
  });
});
