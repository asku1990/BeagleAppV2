import { prisma } from "@db/core/prisma";

export type DogPedigreeAncestorDb = {
  id: string;
  sireId: string | null;
  damId: string | null;
};

export type DogPedigreeAncestryDb = {
  rootId: string;
  nodes: Record<string, DogPedigreeAncestorDb>;
};

export async function loadDogPedigreeAncestryDb(
  rootId: string,
  maxDepth = 10,
): Promise<DogPedigreeAncestryDb> {
  return loadDogPedigreeAncestryFromFrontier(rootId, [rootId], maxDepth);
}

export async function loadDogPedigreeAncestryForParentsDb(
  sireId: string,
  damId: string,
  maxDepth = 9,
): Promise<DogPedigreeAncestryDb> {
  return loadDogPedigreeAncestryFromFrontier(
    `${sireId}:${damId}`,
    [sireId, damId],
    maxDepth,
  );
}

async function loadDogPedigreeAncestryFromFrontier(
  rootId: string,
  initialFrontier: string[],
  maxDepth: number,
): Promise<DogPedigreeAncestryDb> {
  const nodes: Record<string, DogPedigreeAncestorDb> = {};
  const visited = new Set<string>();
  let frontier = initialFrontier;
  let depth = 0;

  while (frontier.length > 0 && depth <= maxDepth) {
    const ids = [...new Set(frontier.filter((id) => !visited.has(id)))];
    if (ids.length === 0) {
      break;
    }

    const rows = await prisma.dog.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        sireId: true,
        damId: true,
      },
    });

    const nextFrontier: string[] = [];
    for (const row of rows) {
      visited.add(row.id);
      nodes[row.id] = {
        id: row.id,
        sireId: row.sireId,
        damId: row.damId,
      };

      if (row.sireId && !visited.has(row.sireId)) {
        nextFrontier.push(row.sireId);
      }

      if (row.damId && !visited.has(row.damId)) {
        nextFrontier.push(row.damId);
      }
    }

    frontier = nextFrontier;
    depth += 1;
  }

  return { rootId, nodes };
}
