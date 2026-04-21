import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  adminTrialEventQueryKey,
  adminTrialEventsQueryKey,
  adminTrialQueryKey,
} from "../query-keys";
import { useAdminTrialEventQuery } from "../use-admin-trial-event-query";
import {
  AdminTrialQueryError,
  isAdminTrialQueryError,
  useAdminTrialQuery,
} from "../use-admin-trial-query";
import { useAdminTrialEventsQuery } from "../use-admin-trial-events-query";

const {
  useQueryMock,
  listAdminTrialsMock,
  getAdminTrialEventMock,
  getAdminTrialMock,
} = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  listAdminTrialsMock: vi.fn(),
  getAdminTrialEventMock: vi.fn(),
  getAdminTrialMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@beagle/api-client", () => ({
  createAdminTrialsApiClient: () => ({
    listAdminTrials: listAdminTrialsMock,
    getAdminTrialEvent: getAdminTrialEventMock,
    getAdminTrial: getAdminTrialMock,
  }),
}));

describe("useAdminTrialEventsQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    listAdminTrialsMock.mockReset();
  });

  it("uses the expected query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminTrialEventsQuery({
      query: "helsinki",
      year: 2026,
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
      adminTrialEventsQueryKey({
        query: "helsinki",
        year: 2026,
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
        filters: {
          mode: "year",
          year: 2026,
          dateFrom: null,
          dateTo: null,
        },
        availableYears: [2026],
        total: 1,
        totalPages: 1,
        page: 1,
        items: [
          {
            trialEventId: "event-1",
            eventDate: "2026-04-14",
            eventPlace: "Helsinki",
            eventName: "Talvikoe",
            organizer: "Talvikoe",
            judge: "Judge One",
            sklKoeId: 1001,
            dogCount: 10,
          },
        ],
      },
    });

    useAdminTrialEventsQuery({ query: "helsinki" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual({
      filters: {
        mode: "year",
        year: 2026,
        dateFrom: null,
        dateTo: null,
      },
      availableYears: [2026],
      total: 1,
      totalPages: 1,
      page: 1,
      items: [
        {
          trialEventId: "event-1",
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          eventName: "Talvikoe",
          organizer: "Talvikoe",
          judge: "Judge One",
          sklKoeId: 1001,
          dogCount: 10,
        },
      ],
    });
  });

  it("throws when action returns error", async () => {
    useQueryMock.mockImplementation((options) => options);
    listAdminTrialsMock.mockResolvedValue({
      ok: false,
      error: "Failed to load admin trial events.",
      code: "INTERNAL_ERROR",
    });

    useAdminTrialEventsQuery({});
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toThrow(
      "Failed to load admin trial events.",
    );
  });
});

describe("useAdminTrialEventQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getAdminTrialEventMock.mockReset();
  });

  it("uses the expected event query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminTrialEventQuery({
      trialEventId: " event-1 ",
    });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: unknown[];
      staleTime: number;
      refetchOnWindowFocus: boolean;
      enabled: boolean;
    };

    expect(options.queryKey).toEqual(adminTrialEventQueryKey("event-1"));
    expect(options.staleTime).toBe(30_000);
    expect(options.refetchOnWindowFocus).toBe(true);
    expect(options.enabled).toBe(true);
  });

  it("is disabled when trial event id is empty", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminTrialEventQuery({
      trialEventId: "   ",
    });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      enabled: boolean;
    };

    expect(options.enabled).toBe(false);
  });

  it.each([
    ["FORBIDDEN", "Admin access required."],
    ["UNAUTHENTICATED", "Sign in required."],
    ["TRIAL_EVENT_NOT_FOUND", "Trial event not found."],
    ["INTERNAL_ERROR", "Failed to load admin trial event details."],
  ])("maps %s to the expected error message", async (code, message) => {
    useQueryMock.mockImplementation((options) => options);
    getAdminTrialEventMock.mockResolvedValue({
      ok: false,
      code,
      error: message,
    });

    useAdminTrialEventQuery({
      trialEventId: "event-1",
    });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toMatchObject({
      message,
      errorCode: code,
      name: "AdminTrialEventQueryError",
    });
  });
});

describe("useAdminTrialQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getAdminTrialMock.mockReset();
  });

  it("uses the expected detail query key and options", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminTrialQuery({
      trialId: " trial-1 ",
    });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryKey: unknown[];
      staleTime: number;
      refetchOnWindowFocus: boolean;
      enabled: boolean;
    };

    expect(options.queryKey).toEqual(adminTrialQueryKey("trial-1"));
    expect(options.staleTime).toBe(30_000);
    expect(options.refetchOnWindowFocus).toBe(true);
    expect(options.enabled).toBe(true);
  });

  it("isAdminTrialQueryError narrows known error type", () => {
    const error = new Error("failed");
    expect(isAdminTrialQueryError(error)).toBe(false);
  });

  it("returns true for AdminTrialQueryError instances", () => {
    expect(
      isAdminTrialQueryError(new AdminTrialQueryError("failed", "X")),
    ).toBe(true);
  });

  it("maps error codes to expected messages", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminTrialMock.mockResolvedValue({
      ok: false,
      code: "TRIAL_NOT_FOUND",
      error: "Trial not found.",
    });

    useAdminTrialQuery({
      trialId: "trial-1",
    });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).rejects.toMatchObject({
      message: "Trial not found.",
      errorCode: "TRIAL_NOT_FOUND",
      name: "AdminTrialQueryError",
    });
  });
});
