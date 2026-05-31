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

import {
  loadDogPedigreeAncestryDb,
  loadDogPedigreeAncestryForParentsDb,
} from "../pedigree-ancestry";

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
        },
        sire: {
          id: "sire",
          sireId: "sire-parent",
          damId: null,
        },
        dam: {
          id: "dam",
          sireId: null,
          damId: null,
        },
        "sire-parent": {
          id: "sire-parent",
          sireId: null,
          damId: null,
        },
      },
    });
  });

  it("loads both parent branches for virtual calculations", async () => {
    dogFindManyMock
      .mockResolvedValueOnce([
        { id: "sire", sireId: "ancestor", damId: null },
        { id: "dam", sireId: "ancestor", damId: null },
      ])
      .mockResolvedValueOnce([{ id: "ancestor", sireId: null, damId: null }]);

    const result = await loadDogPedigreeAncestryForParentsDb("sire", "dam", 9);

    expect(dogFindManyMock).toHaveBeenCalledTimes(2);
    expect(result.rootId).toBe("sire:dam");
    expect(result.nodes.sire?.sireId).toBe("ancestor");
    expect(result.nodes.dam?.sireId).toBe("ancestor");
    expect(result.nodes.ancestor).toEqual({
      id: "ancestor",
      sireId: null,
      damId: null,
    });
  });
});
