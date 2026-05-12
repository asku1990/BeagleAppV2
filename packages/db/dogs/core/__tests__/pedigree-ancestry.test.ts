import { beforeEach, describe, expect, it, vi } from "vitest";

const { dogFindManyMock, prismaMock } = vi.hoisted(() => {
  const dogFindMany = vi.fn();
  return {
    dogFindManyMock: dogFindMany,
    prismaMock: {
      dog: {
        findMany: dogFindMany,
      },
    },
  };
});

vi.mock("../../../core/prisma", () => ({
  prisma: prismaMock,
}));

import { loadDogPedigreeAncestryDb } from "../pedigree-ancestry";

describe("loadDogPedigreeAncestryDb", () => {
  beforeEach(() => {
    dogFindManyMock.mockReset();
  });

  it("loads ancestor nodes breadth-first until the frontier is empty", async () => {
    dogFindManyMock
      .mockResolvedValueOnce([{ id: "root", sireId: "sire", damId: "dam" }])
      .mockResolvedValueOnce([
        { id: "sire", sireId: "sire-parent", damId: null },
        { id: "dam", sireId: null, damId: null },
      ])
      .mockResolvedValueOnce([
        { id: "sire-parent", sireId: null, damId: null },
      ]);

    const result = await loadDogPedigreeAncestryDb("root", 10);

    expect(dogFindManyMock).toHaveBeenCalledTimes(3);
    expect(result).toEqual({
      rootId: "root",
      nodes: {
        root: {
          id: "root",
          sireId: "sire",
          damId: "dam",
          siitosasteProsentti: null,
        },
        sire: {
          id: "sire",
          sireId: "sire-parent",
          damId: null,
          siitosasteProsentti: null,
        },
        dam: {
          id: "dam",
          sireId: null,
          damId: null,
          siitosasteProsentti: null,
        },
        "sire-parent": {
          id: "sire-parent",
          sireId: null,
          damId: null,
          siitosasteProsentti: null,
        },
      },
    });
  });
});
