import { beforeEach, describe, expect, it, vi } from "vitest";
import { listAdminTrials } from "../list-trials";

const { searchAdminTrialsDbMock } = vi.hoisted(() => ({
  searchAdminTrialsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  searchAdminTrialsDb: searchAdminTrialsDbMock,
}));

describe("listAdminTrials", () => {
  beforeEach(() => {
    searchAdminTrialsDbMock.mockReset();
  });

  it("returns trials from db in contract format", async () => {
    searchAdminTrialsDbMock.mockResolvedValue({
      total: 2,
      totalPages: 1,
      page: 1,
      items: [
        {
          trialId: "trial_1",
          dogName: "Rex",
          registrationNo: "FI12345/24",
          sklKoeId: 123456,
          entryKey: "entry-1",
          eventDate: new Date("2026-04-14T08:00:00.000Z"),
          eventPlace: "Helsinki",
          ylituomariNimi: "Judge One",
          loppupisteet: 91.5,
          palkinto: "A",
          sijoitus: "1",
        },
        {
          trialId: "trial_2",
          dogName: "Mila",
          registrationNo: null,
          sklKoeId: null,
          entryKey: "entry-2",
          eventDate: new Date("2026-04-15T08:00:00.000Z"),
          eventPlace: "Tampere",
          ylituomariNimi: null,
          loppupisteet: null,
          palkinto: null,
          sijoitus: null,
        },
      ],
    });

    await expect(
      listAdminTrials(
        {
          query: "rex",
          page: 2,
          pageSize: 500,
          sort: "date-asc",
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: "admin",
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          total: 2,
          totalPages: 1,
          page: 1,
          items: [
            {
              trialId: "trial_1",
              dogName: "Rex",
              registrationNo: "FI12345/24",
              sklKoeId: 123456,
              entryKey: "entry-1",
              eventDate: "2026-04-14",
              eventPlace: "Helsinki",
              ylituomariNimi: "Judge One",
              loppupisteet: 91.5,
              palkinto: "A",
              sijoitus: "1",
            },
            {
              trialId: "trial_2",
              dogName: "Mila",
              registrationNo: null,
              sklKoeId: null,
              entryKey: "entry-2",
              eventDate: "2026-04-15",
              eventPlace: "Tampere",
              ylituomariNimi: null,
              loppupisteet: null,
              palkinto: null,
              sijoitus: null,
            },
          ],
        },
      },
    });

    expect(searchAdminTrialsDbMock).toHaveBeenCalledWith({
      query: "rex",
      page: 2,
      pageSize: 100,
      sort: "date-asc",
    });
  });

  it("returns forbidden when the user is not an admin", async () => {
    await expect(listAdminTrials({}, null)).resolves.toEqual({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });

    expect(searchAdminTrialsDbMock).not.toHaveBeenCalled();
  });

  it("returns invalid sort without calling db", async () => {
    await expect(
      listAdminTrials(
        { sort: "bogus" as never },
        {
          id: "u_1",
          email: "admin@example.com",
          username: "admin",
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Invalid sort value.",
        code: "INVALID_SORT",
      },
    });

    expect(searchAdminTrialsDbMock).not.toHaveBeenCalled();
  });

  it("returns internal error when db query fails", async () => {
    searchAdminTrialsDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      listAdminTrials(
        {},
        {
          id: "u_1",
          email: "admin@example.com",
          username: "admin",
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin trials.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
