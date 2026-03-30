import { beforeEach, describe, expect, it, vi } from "vitest";
import { DogSex } from "@prisma/client";

const { dogCountMock, dogFindManyMock, prismaMock } = vi.hoisted(() => {
  const dogCount = vi.fn();
  const dogFindMany = vi.fn();

  return {
    dogCountMock: dogCount,
    dogFindManyMock: dogFindMany,
    prismaMock: {
      dog: {
        count: dogCount,
        findMany: dogFindMany,
      },
    },
  };
});

vi.mock("../../../../core/prisma", () => ({
  prisma: prismaMock,
}));

import { listAdminDogsDb } from "../list-dogs";

describe("listAdminDogsDb", () => {
  beforeEach(() => {
    dogCountMock.mockReset();
    dogFindManyMock.mockReset();
  });

  it("returns empty response when no dogs match", async () => {
    dogCountMock.mockResolvedValue(0);

    await expect(listAdminDogsDb({ query: "missing" })).resolves.toEqual({
      total: 0,
      totalPages: 0,
      page: 1,
      items: [],
    });

    expect(dogFindManyMock).not.toHaveBeenCalled();
  });

  it("maps relation data for admin list items", async () => {
    dogCountMock.mockResolvedValue(1);
    dogFindManyMock.mockResolvedValue([
      {
        id: "dog_1",
        name: "Metsapolun Kide",
        sex: DogSex.FEMALE,
        birthDate: new Date("2021-04-09T00:00:00.000Z"),
        breederNameText: "Metsapolun",
        note: "Important",
        ekNo: 5588,
        breeder: { name: "Metsapolun" },
        registrations: [{ registrationNo: "FI12345/21" }],
        ownerships: [
          { owner: { name: "Tiina Virtanen" } },
          { owner: { name: "Antti Virtanen" } },
          { owner: { name: "Tiina Virtanen" } },
        ],
        sire: {
          id: "dog_sire",
          name: "Korven Aatos",
          registrations: [{ registrationNo: "FI54321/20" }],
        },
        dam: {
          id: "dog_dam",
          name: "Havupolun Helmi",
          registrations: [{ registrationNo: "FI77777/18" }],
        },
        _count: {
          trialResults: 7,
          showEntries: 4,
        },
      },
    ]);

    await expect(listAdminDogsDb({ query: "kide" })).resolves.toEqual({
      total: 1,
      totalPages: 1,
      page: 1,
      items: [
        {
          id: "dog_1",
          registrationNo: "FI12345/21",
          secondaryRegistrationNos: [],
          name: "Metsapolun Kide",
          sex: "FEMALE",
          birthDate: new Date("2021-04-09T00:00:00.000Z"),
          breederName: "Metsapolun",
          ownerNames: ["Tiina Virtanen", "Antti Virtanen"],
          sire: {
            id: "dog_sire",
            name: "Korven Aatos",
            registrationNo: "FI54321/20",
          },
          dam: {
            id: "dog_dam",
            name: "Havupolun Helmi",
            registrationNo: "FI77777/18",
          },
          trialCount: 7,
          showCount: 4,
          ekNo: 5588,
          note: "Important",
        },
      ],
    });
  });

  it("applies sex/query filters and clamps page", async () => {
    dogCountMock.mockResolvedValue(25);
    dogFindManyMock.mockResolvedValue([]);

    await listAdminDogsDb({
      query: "5588",
      sex: "FEMALE",
      page: 99,
      pageSize: 10,
      sort: "birth-desc",
    });

    const countArgs = dogCountMock.mock.calls[0]?.[0] as { where: unknown };
    const whereJson = JSON.stringify(countArgs.where);
    expect(whereJson).toContain("FEMALE");
    expect(whereJson).toContain("5588");

    const findManyArgs = dogFindManyMock.mock.calls[0]?.[0] as {
      skip: number;
      take: number;
      orderBy: unknown;
    };

    expect(findManyArgs.skip).toBe(20);
    expect(findManyArgs.take).toBe(10);
    expect(JSON.stringify(findManyArgs.orderBy)).toContain("birthDate");
  });

  it("does not apply ekNo filter for numeric queries", async () => {
    dogCountMock.mockResolvedValue(1);
    dogFindManyMock.mockResolvedValue([]);

    await listAdminDogsDb({ query: "5588" });

    const countArgs = dogCountMock.mock.calls[0]?.[0] as {
      where?: {
        AND?: Array<{ OR?: Array<Record<string, unknown>> }>;
      };
    };

    const orFilters = countArgs.where?.AND?.[0]?.OR ?? [];

    expect(orFilters.some((filter) => "ekNo" in filter)).toBe(false);
    expect(JSON.stringify(countArgs.where)).toContain("5588");
  });
});
