import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDogsService } from "../search";
import { encodeShowId } from "../../shows/internal/show-id";
import { encodeTrialId } from "../../trials/internal/trial-id";

const {
  searchBeagleDogsDbMock,
  getNewestBeagleDogsDbMock,
  getBeagleDogProfileDbMock,
  getBeagleShowsForDogDbMock,
  getBeagleTrialsForDogDbMock,
} = vi.hoisted(() => ({
  searchBeagleDogsDbMock: vi.fn(),
  getNewestBeagleDogsDbMock: vi.fn(),
  getBeagleDogProfileDbMock: vi.fn(),
  getBeagleShowsForDogDbMock: vi.fn(),
  getBeagleTrialsForDogDbMock: vi.fn(),
}));

vi.mock("@beagle/db", async () => {
  const actual = await vi.importActual<object>("@beagle/db");
  return {
    ...actual,
    searchBeagleDogsDb: searchBeagleDogsDbMock,
    getNewestBeagleDogsDb: getNewestBeagleDogsDbMock,
    getBeagleDogProfileDb: getBeagleDogProfileDbMock,
    getBeagleShowsForDogDb: getBeagleShowsForDogDbMock,
    getBeagleTrialsForDogDb: getBeagleTrialsForDogDbMock,
  };
});

describe("dogs service", () => {
  beforeEach(() => {
    searchBeagleDogsDbMock.mockReset();
    getNewestBeagleDogsDbMock.mockReset();
    getBeagleDogProfileDbMock.mockReset();
    getBeagleShowsForDogDbMock.mockReset();
    getBeagleTrialsForDogDbMock.mockReset();
  });

  it("returns 400 for invalid sort and does not call DB", async () => {
    const service = createDogsService();
    const result = await service.searchBeagleDogs({ sort: "nope" as never });

    expect(result).toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Invalid sort value.",
      },
    });
    expect(searchBeagleDogsDbMock).not.toHaveBeenCalled();
  });

  it("normalizes page/pageSize and passes through core+advanced fields", async () => {
    const createdAt = new Date("2026-02-01T10:00:00.000Z");
    const birthDate = new Date("2020-05-01T00:00:00.000Z");
    searchBeagleDogsDbMock.mockResolvedValue({
      mode: "combined",
      total: 25,
      totalPages: 3,
      page: 3,
      items: [
        {
          id: "d1",
          ekNo: 42,
          registrationNo: "FI-1/20",
          registrationNos: ["FI-1/20"],
          createdAt,
          sex: "U",
          name: "Alpha",
          birthDate,
          sire: "SIRE",
          dam: "DAM",
          trialCount: 2,
          showCount: 1,
        },
      ],
    });

    const service = createDogsService();
    const result = await service.searchBeagleDogs({
      ek: " 42 ",
      reg: "FI-",
      name: "Al",
      sex: "male",
      birthYearFrom: 2019.7,
      birthYearTo: 2021.9,
      ekOnly: true,
      multipleRegsOnly: true,
      page: -9,
      pageSize: 999,
      sort: "ek-asc",
    });

    expect(searchBeagleDogsDbMock).toHaveBeenCalledWith({
      ek: " 42 ",
      reg: "FI-",
      name: "Al",
      sex: "male",
      birthYearFrom: 2019.7,
      birthYearTo: 2021.9,
      ekOnly: true,
      multipleRegsOnly: true,
      page: 1,
      pageSize: 100,
      sort: "ek-asc",
    });

    expect(result).toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          mode: "combined",
          total: 25,
          totalPages: 3,
          page: 3,
          items: [
            {
              id: "d1",
              ekNo: 42,
              registrationNo: "FI-1/20",
              registrationNos: ["FI-1/20"],
              createdAt: "2026-02-01T10:00:00.000Z",
              sex: "U",
              name: "Alpha",
              birthDate: "2020-05-01",
              sire: "SIRE",
              dam: "DAM",
              trialCount: 2,
              showCount: 1,
            },
          ],
        },
      },
    });
  });

  it("returns 500 when search DB call throws", async () => {
    searchBeagleDogsDbMock.mockRejectedValue(new Error("db fail"));
    const service = createDogsService();
    const result = await service.searchBeagleDogs({ name: "x" });

    expect(result).toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load beagle search results.",
      },
    });
  });

  it("maps newest dogs result and clamps limit", async () => {
    getNewestBeagleDogsDbMock.mockResolvedValue([
      {
        id: "d2",
        ekNo: null,
        registrationNo: "FI-2/20",
        registrationNos: ["FI-2/20"],
        createdAt: new Date("2026-02-02T10:00:00.000Z"),
        sex: "N",
        name: "Beta",
        birthDate: new Date("2020-01-01T00:00:00+02:00"),
        sire: "SIRE2",
        dam: "DAM2",
        trialCount: 0,
        showCount: 0,
      },
    ]);
    const service = createDogsService();
    const result = await service.getNewestBeagleDogs({ limit: 999 });

    expect(getNewestBeagleDogsDbMock).toHaveBeenCalledWith(20);
    expect(result).toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          items: [
            {
              id: "d2",
              ekNo: null,
              registrationNo: "FI-2/20",
              registrationNos: ["FI-2/20"],
              createdAt: "2026-02-02T10:00:00.000Z",
              sex: "N",
              name: "Beta",
              birthDate: "2020-01-01",
              sire: "SIRE2",
              dam: "DAM2",
              trialCount: 0,
              showCount: 0,
            },
          ],
        },
      },
    });
  });

  it("uses default/min newest limits and maps null birthDate", async () => {
    getNewestBeagleDogsDbMock.mockResolvedValue([
      {
        id: "d3",
        ekNo: 7,
        registrationNo: "FI-3/20",
        registrationNos: ["FI-3/20"],
        createdAt: new Date("2026-02-03T10:00:00.000Z"),
        sex: "U",
        name: "Gamma",
        birthDate: null,
        sire: null,
        dam: null,
        trialCount: 1,
        showCount: 2,
      },
    ]);
    const service = createDogsService();

    await service.getNewestBeagleDogs();
    const clamped = await service.getNewestBeagleDogs({ limit: 0 });

    expect(getNewestBeagleDogsDbMock).toHaveBeenNthCalledWith(1, 5);
    expect(getNewestBeagleDogsDbMock).toHaveBeenNthCalledWith(2, 1);
    expect(clamped).toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          items: [
            {
              id: "d3",
              ekNo: 7,
              registrationNo: "FI-3/20",
              registrationNos: ["FI-3/20"],
              createdAt: "2026-02-03T10:00:00.000Z",
              sex: "U",
              name: "Gamma",
              birthDate: null,
              sire: null,
              dam: null,
              trialCount: 1,
              showCount: 2,
            },
          ],
        },
      },
    });
  });

  it("returns 500 when newest dogs DB call throws", async () => {
    getNewestBeagleDogsDbMock.mockRejectedValue(new Error("db fail"));

    const service = createDogsService();
    const result = await service.getNewestBeagleDogs({ limit: 5 });

    expect(result).toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load newest beagles.",
      },
    });
  });

  it("returns 200 and data when dog profile is found", async () => {
    const mockProfile = {
      id: "dog1",
      name: "Alpha",
      title: null,
      registrationNo: "FI-1/20",
      registrationNos: ["FI-1/20"],
      birthDate: new Date("2020-01-01T00:00:00.000Z"),
      sex: "U",
      color: null,
      ekNo: 42,
      inbreedingCoefficientPct: null,
      sire: { name: "Sire", registrationNo: "FI-2/18" },
      dam: { name: "Dam", registrationNo: "FI-3/18" },
      pedigree: [],
      offspringSummary: { litterCount: 1, puppyCount: 2 },
      litters: [
        {
          id: "litter-1",
          birthDate: new Date("2024-05-01T00:00:00.000Z"),
          otherParent: { name: "Dam", registrationNo: "FI-3/18" },
          puppyCount: 2,
          puppies: [
            {
              id: "p1",
              dogId: "p1",
              name: "Puppy 1",
              registrationNo: "FI-10/24",
              sex: "U",
              ekNo: 11,
              trialCount: 4,
              showCount: 2,
              litterCount: 1,
            },
          ],
        },
      ],
    };
    const mockShows = [
      {
        id: "show1",
        place: "City",
        date: new Date("2024-01-01T00:00:00.000Z"),
        result: "JUN1",
        judge: "Judge",
        heightCm: 39,
      },
    ];
    const mockTrials = [
      {
        id: "trial1",
        place: "Town",
        date: new Date("2022-02-02T00:00:00.000Z"),
        weather: "P",
        className: "VOI",
        classCode: "A",
        rank: "1",
        points: 85.5,
        award: "1",
        judge: "Judge Main",
        haku: 4.1,
        hauk: 4.2,
        yva: 4.3,
        hlo: 0.1,
        alo: 0.2,
        tja: 0.3,
        pin: 6,
      },
    ];
    getBeagleDogProfileDbMock.mockResolvedValue(mockProfile);
    getBeagleShowsForDogDbMock.mockResolvedValue(mockShows);
    getBeagleTrialsForDogDbMock.mockResolvedValue(mockTrials);

    const service = createDogsService();
    const result = await service.getBeagleDogProfile("dog1");

    expect(getBeagleDogProfileDbMock).toHaveBeenCalledWith("dog1");
    expect(getBeagleShowsForDogDbMock).toHaveBeenCalledWith("dog1");
    expect(getBeagleTrialsForDogDbMock).toHaveBeenCalledWith("dog1");
    expect(result).toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          ...mockProfile,
          birthDate: "2020-01-01",
          litters: [
            {
              ...mockProfile.litters[0],
              birthDate: "2024-05-01",
            },
          ],
          shows: [
            {
              ...mockShows[0],
              showId: encodeShowId("2024-01-01", "City"),
              date: "2024-01-01",
              result: "JUN-ERI",
            },
          ],
          trials: [
            {
              id: "trial1",
              trialId: encodeTrialId("2022-02-02", "Town"),
              place: "Town",
              date: "2022-02-02",
              weather: "P",
              className: "VOI",
              rank: "1",
              points: 85.5,
              award: "Avo 1",
              judge: "Judge Main",
              haku: 4.1,
              hauk: 4.2,
              yva: 4.3,
              hlo: 0.1,
              alo: 0.2,
              tja: 0.3,
              pin: 6,
            },
          ],
        },
      },
    });
  });

  it("maps date-only profile fields in Helsinki timezone", async () => {
    const mockProfile = {
      id: "dog2",
      name: "Beta",
      title: null,
      registrationNo: "FI-2/20",
      registrationNos: ["FI-2/20"],
      birthDate: new Date("2020-01-01T00:00:00+02:00"),
      sex: "N",
      color: null,
      ekNo: null,
      inbreedingCoefficientPct: null,
      sire: null,
      dam: null,
      pedigree: [],
      offspringSummary: { litterCount: 0, puppyCount: 0 },
      litters: [],
    };
    const mockShows = [
      {
        id: "show2",
        place: "Helsinki",
        date: new Date("2022-03-15T00:00:00+02:00"),
        result: null,
        judge: null,
        heightCm: null,
      },
    ];
    const mockTrials = [
      {
        id: "trial2",
        place: "Lahti",
        date: new Date("2022-04-16T00:00:00+03:00"),
        weather: null,
        className: null,
        classCode: null,
        rank: null,
        points: null,
        award: null,
        judge: null,
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        tja: null,
        pin: null,
      },
    ];
    getBeagleDogProfileDbMock.mockResolvedValue(mockProfile);
    getBeagleShowsForDogDbMock.mockResolvedValue(mockShows);
    getBeagleTrialsForDogDbMock.mockResolvedValue(mockTrials);

    const service = createDogsService();
    const result = await service.getBeagleDogProfile("dog2");

    expect(result).toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          ...mockProfile,
          birthDate: "2020-01-01",
          shows: [
            {
              ...mockShows[0],
              showId: encodeShowId("2022-03-15", "Helsinki"),
              date: "2022-03-15",
            },
          ],
          trials: [
            {
              id: "trial2",
              trialId: encodeTrialId("2022-04-16", "Lahti"),
              place: "Lahti",
              date: "2022-04-16",
              weather: null,
              className: null,
              rank: null,
              points: null,
              award: null,
              judge: null,
              haku: null,
              hauk: null,
              yva: null,
              hlo: null,
              alo: null,
              tja: null,
              pin: null,
            },
          ],
        },
      },
    });
  });

  it("preserves non-code casing in show results", async () => {
    const mockProfile = {
      id: "dog-casing",
      name: "Case Dog",
      title: null,
      registrationNo: "FI-7/21",
      registrationNos: ["FI-7/21"],
      birthDate: null,
      sex: "N",
      color: null,
      ekNo: null,
      inbreedingCoefficientPct: null,
      sire: null,
      dam: null,
      pedigree: [],
      offspringSummary: { litterCount: 0, puppyCount: 0 },
      litters: [],
    };
    const mockShows = [
      {
        id: "show-case",
        place: "City",
        date: new Date("2024-02-01T00:00:00.000Z"),
        result: "JUN1 (specialNote)",
        judge: null,
        heightCm: null,
      },
    ];
    getBeagleDogProfileDbMock.mockResolvedValue(mockProfile);
    getBeagleShowsForDogDbMock.mockResolvedValue(mockShows);
    getBeagleTrialsForDogDbMock.mockResolvedValue([]);

    const service = createDogsService();
    const result = await service.getBeagleDogProfile("dog-casing");

    expect(result).toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          ...mockProfile,
          shows: [
            {
              ...mockShows[0],
              showId: encodeShowId("2024-02-01", "City"),
              date: "2024-02-01",
              result: "JUN-ERI (specialNote)",
            },
          ],
          trials: [],
        },
      },
    });
  });

  it("returns 404 when dog profile is missing", async () => {
    getBeagleDogProfileDbMock.mockResolvedValue(null);

    const service = createDogsService();
    const result = await service.getBeagleDogProfile("missing");

    expect(getBeagleShowsForDogDbMock).not.toHaveBeenCalled();
    expect(getBeagleTrialsForDogDbMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: 404,
      body: { ok: false, error: "Dog profile not found." },
    });
  });

  it("returns 400 when dogId is empty", async () => {
    const service = createDogsService();
    const result = await service.getBeagleDogProfile("");

    expect(result).toEqual({
      status: 400,
      body: { ok: false, error: "Dog ID is required." },
    });
  });

  it("trims dogId before profile DB call", async () => {
    getBeagleDogProfileDbMock.mockResolvedValue({
      id: "dog-casing",
      name: "Case Dog",
      title: null,
      registrationNo: "FI-7/21",
      registrationNos: ["FI-7/21"],
      birthDate: null,
      sex: "N",
      color: null,
      ekNo: null,
      inbreedingCoefficientPct: null,
      sire: null,
      dam: null,
      pedigree: [],
      offspringSummary: { litterCount: 0, puppyCount: 0 },
      litters: [],
    });
    getBeagleShowsForDogDbMock.mockResolvedValue([]);
    getBeagleTrialsForDogDbMock.mockResolvedValue([]);

    const service = createDogsService();
    await service.getBeagleDogProfile(" dog-casing ");

    expect(getBeagleDogProfileDbMock).toHaveBeenCalledWith("dog-casing");
    expect(getBeagleShowsForDogDbMock).toHaveBeenCalledWith("dog-casing");
    expect(getBeagleTrialsForDogDbMock).toHaveBeenCalledWith("dog-casing");
  });

  it("returns 500 when profile DB call throws", async () => {
    getBeagleDogProfileDbMock.mockRejectedValue(new Error("db fail"));
    const service = createDogsService();
    const result = await service.getBeagleDogProfile("dog1");

    expect(result).toEqual({
      status: 500,
      body: { ok: false, error: "Failed to load dog profile." },
    });
  });
});
