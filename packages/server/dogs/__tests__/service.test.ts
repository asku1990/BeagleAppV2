import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDogsService } from "../service";

const {
  searchBeagleDogsDbMock,
  getNewestBeagleDogsDbMock,
  getBeagleDogProfileDbMock,
} = vi.hoisted(() => ({
  searchBeagleDogsDbMock: vi.fn(),
  getNewestBeagleDogsDbMock: vi.fn(),
  getBeagleDogProfileDbMock: vi.fn(),
}));

vi.mock("@beagle/db", async () => {
  const actual = await vi.importActual<object>("@beagle/db");
  return {
    ...actual,
    searchBeagleDogsDb: searchBeagleDogsDbMock,
    getNewestBeagleDogsDb: getNewestBeagleDogsDbMock,
    getBeagleDogProfileDb: getBeagleDogProfileDbMock,
  };
});

describe("dogs service", () => {
  beforeEach(() => {
    searchBeagleDogsDbMock.mockReset();
    getNewestBeagleDogsDbMock.mockReset();
    getBeagleDogProfileDbMock.mockReset();
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

    expect(result.status).toBe(200);
    expect(result.body.ok).toBe(true);
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
    getNewestBeagleDogsDbMock.mockResolvedValue([]);
    const service = createDogsService();
    await service.getNewestBeagleDogs({ limit: 999 });

    expect(getNewestBeagleDogsDbMock).toHaveBeenCalledWith(20);
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
      shows: [
        {
          id: "show1",
          place: "City",
          date: new Date("2022-01-01T00:00:00.000Z"),
          result: "ERI",
          judge: "Judge",
          heightCm: 39,
        },
      ],
      trials: [
        {
          id: "trial1",
          place: "Town",
          date: new Date("2022-02-02T00:00:00.000Z"),
          weather: "P",
          className: "VOI",
          rank: "1",
          points: 85.5,
        },
      ],
    };
    getBeagleDogProfileDbMock.mockResolvedValue(mockProfile);

    const service = createDogsService();
    const result = await service.getBeagleDogProfile("dog1");

    expect(result).toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          ...mockProfile,
          birthDate: "2020-01-01",
          shows: [{ ...mockProfile.shows[0], date: "2022-01-01" }],
          trials: [{ ...mockProfile.trials[0], date: "2022-02-02" }],
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
      shows: [
        {
          id: "show2",
          place: "Helsinki",
          date: new Date("2022-03-15T00:00:00+02:00"),
          result: null,
          judge: null,
          heightCm: null,
        },
      ],
      trials: [
        {
          id: "trial2",
          place: "Lahti",
          date: new Date("2022-04-16T00:00:00+03:00"),
          weather: null,
          className: null,
          rank: null,
          points: null,
          award: null,
        },
      ],
    };
    getBeagleDogProfileDbMock.mockResolvedValue(mockProfile);

    const service = createDogsService();
    const result = await service.getBeagleDogProfile("dog2");

    expect(result).toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          ...mockProfile,
          birthDate: "2020-01-01",
          shows: [{ ...mockProfile.shows[0], date: "2022-03-15" }],
          trials: [{ ...mockProfile.trials[0], date: "2022-04-16" }],
        },
      },
    });
  });

  it("returns 404 when dog profile is missing", async () => {
    getBeagleDogProfileDbMock.mockResolvedValue(null);

    const service = createDogsService();
    const result = await service.getBeagleDogProfile("missing");

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
