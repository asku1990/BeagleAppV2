import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminShowEventQueryKey } from "../query-keys";
import { useAdminShowEventQuery } from "../use-admin-show-event-query";

const { useQueryMock, getAdminShowEventMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getAdminShowEventMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@beagle/api-client", () => ({
  createAdminShowsApiClient: () => ({
    getAdminShowEvent: getAdminShowEventMock,
  }),
}));

describe("useAdminShowEventQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getAdminShowEventMock.mockReset();
  });

  it("uses expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminShowEventQuery({ showId: "show-1" });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: readonly unknown[];
      staleTime: number;
      refetchOnWindowFocus: boolean;
      retryDelay: number;
      retry: (failureCount: number, error: unknown) => boolean;
    };

    expect(options.queryKey).toEqual(adminShowEventQueryKey("show-1"));
    expect(options.staleTime).toBe(30_000);
    expect(options.refetchOnWindowFocus).toBe(true);
    expect(options.retryDelay).toBe(300);
    expect(options.retry).toBe(false);
  });

  it("disables the query when the show id is empty", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminShowEventQuery({ showId: "   " });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      enabled: boolean;
      queryKey: readonly unknown[];
    };

    expect(options.enabled).toBe(false);
    expect(options.queryKey).toEqual(adminShowEventQueryKey(""));
  });

  it("returns data when api client succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminShowEventMock.mockResolvedValue({
      ok: true,
      data: {
        show: {
          showId: "show-1",
          eventDate: "2025-06-01",
          eventPlace: "Helsinki",
          eventCity: "Helsinki",
          eventName: "Summer Show",
          eventType: "A",
          organizer: "Beagle Club",
          judge: "Judge",
          dogCount: 1,
          entries: [],
        },
        options: {
          classOptions: [],
          qualityOptions: [],
          awardOptions: [],
          pupnOptions: [],
        },
      },
    });

    useAdminShowEventQuery({ showId: "show-1" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual({
      show: {
        showId: "show-1",
        eventDate: "2025-06-01",
        eventPlace: "Helsinki",
        eventCity: "Helsinki",
        eventName: "Summer Show",
        eventType: "A",
        organizer: "Beagle Club",
        judge: "Judge",
        dogCount: 1,
        entries: [],
      },
      options: {
        classOptions: [],
        qualityOptions: [],
        awardOptions: [],
        pupnOptions: [],
      },
    });
  });

  it("throws when api client returns not found", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminShowEventMock.mockResolvedValue({
      ok: false,
      error: "Show not found.",
      code: "SHOW_NOT_FOUND",
    });

    useAdminShowEventQuery({ showId: "missing" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toMatchObject({
      message: "Show not found.",
      errorCode: "SHOW_NOT_FOUND",
    });
  });
});
