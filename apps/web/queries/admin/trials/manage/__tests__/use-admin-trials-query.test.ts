import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminTrialQueryKey, adminTrialsQueryKey } from "../query-keys";
import {
  isAdminTrialQueryError,
  useAdminTrialQuery,
} from "../use-admin-trial-query";
import { useAdminTrialsQuery } from "../use-admin-trials-query";

const { useQueryMock, listAdminTrialsMock, getAdminTrialMock } = vi.hoisted(
  () => ({
    useQueryMock: vi.fn(),
    listAdminTrialsMock: vi.fn(),
    getAdminTrialMock: vi.fn(),
  }),
);

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("@beagle/api-client", () => ({
  createAdminTrialsApiClient: () => ({
    listAdminTrials: listAdminTrialsMock,
    getAdminTrial: getAdminTrialMock,
  }),
}));

describe("useAdminTrialsQuery", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    listAdminTrialsMock.mockReset();
    getAdminTrialMock.mockReset();
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
            sklKoeId: 123456,
            entryKey: "entry-1",
            eventDate: "2026-04-14",
            eventPlace: "Helsinki",
            ylituomariNimi: "Judge",
            loppupisteet: 98.5,
            palkinto: "1",
            sijoitus: "2",
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
          sklKoeId: 123456,
          entryKey: "entry-1",
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          ylituomariNimi: "Judge",
          loppupisteet: 98.5,
          palkinto: "1",
          sijoitus: "2",
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

  it("is disabled when trial id is empty", () => {
    useQueryMock.mockImplementation((options) => options);

    useAdminTrialQuery({
      trialId: "   ",
    });

    const options = useQueryMock.mock.calls[0]?.[0] as {
      enabled: boolean;
    };

    expect(options.enabled).toBe(false);
  });

  it("returns detail data when request succeeds", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminTrialMock.mockResolvedValue({
      ok: true,
      data: {
        trial: {
          trialId: "trial-1",
          dogId: null,
          dogName: "Rex",
          registrationNo: "FI123",
          sklKoeId: 54321,
          entryKey: "entry-1",
          eventDate: "2026-04-14",
          eventName: null,
          eventPlace: "Helsinki",
          kennelDistrict: null,
          kennelDistrictNo: null,
          keli: null,
          paljasMaa: null,
          lumikeli: null,
          luokka: null,
          palkinto: null,
          loppupisteet: null,
          sijoitus: null,
          hakuKeskiarvo: null,
          haukkuKeskiarvo: null,
          yleisvaikutelmaPisteet: null,
          hakuloysyysTappioYhteensa: null,
          ajoloysyysTappioYhteensa: null,
          tieJaEstetyoskentelyPisteet: null,
          metsastysintoPisteet: null,
          ylituomariNimi: null,
          rokotusOk: null,
          tunnistusOk: null,
          notes: null,
          rawPayloadJson: null,
          rawPayloadAvailable: false,
          createdAt: "2026-04-14T10:00:00.000Z",
          updatedAt: "2026-04-14T10:00:00.000Z",
        },
      },
    });

    useAdminTrialQuery({ trialId: "trial-1" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    await expect(options.queryFn()).resolves.toEqual({
      trial: {
        trialId: "trial-1",
        dogId: null,
        dogName: "Rex",
        registrationNo: "FI123",
        sklKoeId: 54321,
        entryKey: "entry-1",
        eventDate: "2026-04-14",
        eventName: null,
        eventPlace: "Helsinki",
        kennelDistrict: null,
        kennelDistrictNo: null,
        keli: null,
        paljasMaa: null,
        lumikeli: null,
        luokka: null,
        palkinto: null,
        loppupisteet: null,
        sijoitus: null,
        hakuKeskiarvo: null,
        haukkuKeskiarvo: null,
        yleisvaikutelmaPisteet: null,
        hakuloysyysTappioYhteensa: null,
        ajoloysyysTappioYhteensa: null,
        tieJaEstetyoskentelyPisteet: null,
        metsastysintoPisteet: null,
        ylituomariNimi: null,
        rokotusOk: null,
        tunnistusOk: null,
        notes: null,
        rawPayloadJson: null,
        rawPayloadAvailable: false,
        createdAt: "2026-04-14T10:00:00.000Z",
        updatedAt: "2026-04-14T10:00:00.000Z",
      },
    });
  });

  it("throws mapped not found error for detail query", async () => {
    useQueryMock.mockImplementation((options) => options);
    getAdminTrialMock.mockResolvedValue({
      ok: false,
      error: "Trial not found.",
      code: "TRIAL_NOT_FOUND",
    });

    useAdminTrialQuery({ trialId: "trial-1" });
    const options = useQueryMock.mock.calls[0]?.[0] as {
      queryFn: () => Promise<unknown>;
    };

    let thrownError: unknown;
    try {
      await options.queryFn();
    } catch (error) {
      thrownError = error;
    }

    expect(isAdminTrialQueryError(thrownError)).toBe(true);
    if (!isAdminTrialQueryError(thrownError)) {
      throw new Error("Expected AdminTrialQueryError.");
    }
    expect(thrownError.message).toBe("Trial not found.");
    expect(thrownError.errorCode).toBe("TRIAL_NOT_FOUND");
  });
});
