import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDogsService } from "../service";

const { searchBeagleDogsDbMock, getNewestBeagleDogsDbMock } = vi.hoisted(
  () => ({
    searchBeagleDogsDbMock: vi.fn(),
    getNewestBeagleDogsDbMock: vi.fn(),
  }),
);

vi.mock("@beagle/db", async () => {
  const actual = await vi.importActual<object>("@beagle/db");
  return {
    ...actual,
    searchBeagleDogsDb: searchBeagleDogsDbMock,
    getNewestBeagleDogsDb: getNewestBeagleDogsDbMock,
  };
});

describe("dogs service", () => {
  beforeEach(() => {
    searchBeagleDogsDbMock.mockReset();
    getNewestBeagleDogsDbMock.mockReset();
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
              birthDate: "2020-05-01T00:00:00.000Z",
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
    const createdAt = new Date("2026-02-02T10:00:00.000Z");
    const birthDate = new Date("2021-01-01T00:00:00.000Z");
    getNewestBeagleDogsDbMock.mockResolvedValue([
      {
        id: "n1",
        ekNo: 10,
        registrationNo: "FI-10/24",
        registrationNos: ["FI-10/24"],
        createdAt,
        sex: "N",
        name: "Newest",
        birthDate,
        sire: "SIRE",
        dam: "DAM",
        trialCount: 4,
        showCount: 5,
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
              id: "n1",
              ekNo: 10,
              registrationNo: "FI-10/24",
              registrationNos: ["FI-10/24"],
              createdAt: "2026-02-02T10:00:00.000Z",
              sex: "N",
              name: "Newest",
              birthDate: "2021-01-01T00:00:00.000Z",
              sire: "SIRE",
              dam: "DAM",
              trialCount: 4,
              showCount: 5,
            },
          ],
        },
      },
    });
  });

  it("uses default newest limit when missing", async () => {
    getNewestBeagleDogsDbMock.mockResolvedValue([]);
    const service = createDogsService();

    await service.getNewestBeagleDogs();

    expect(getNewestBeagleDogsDbMock).toHaveBeenCalledWith(5);
  });

  it("returns 500 when newest DB call throws", async () => {
    getNewestBeagleDogsDbMock.mockRejectedValue(new Error("db fail"));
    const service = createDogsService();

    const result = await service.getNewestBeagleDogs({ limit: 1 });

    expect(result).toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load newest beagles.",
      },
    });
  });
});
