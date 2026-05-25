import type { DogPedigreeAncestryDb } from "@beagle/db";
import { INBREEDING_DEFAULT_ANCESTOR_FA_DEPTH } from "./inbreeding-ancestry-depth";

// Calculates the legacy inbreeding percentage from shared ancestor paths in a
// bounded pedigree matrix, preserving the import-time weighting semantics.
type PedigreeMatrix = Record<number, Record<number, string | null>>;

type SharedOccurrence = {
  id: string;
  sireGeneration: number;
  sireIndex: number;
  damGeneration: number;
  damIndex: number;
  contributionPct: number;
  include: boolean;
};

export type InbreedingContributionBreakdown = SharedOccurrence;

export type GroupedInbreedingContributionBreakdown = {
  id: string;
  rawContributionPct: number;
  adjustedContributionPct: number;
  occurrenceCount: number;
  sireGeneration: number;
  sireIndex: number;
  damGeneration: number;
  damIndex: number;
};

export type InbreedingCoefficientBreakdownPct = {
  sharedAncestorCount: number;
  sharedOccurrenceCount: number;
  includedOccurrenceCount: number;
  includedSirePositionCount: number;
  includedDamPositionCount: number;
  includedPositionCount: number;
  knownSlotCount: number;
  knownPedigreePct: number;
  contributionPct: number;
  contributions: GroupedInbreedingContributionBreakdown[];
};

type InbreedingCalculationContext = {
  dynamicInbreedingPctByDogId: Map<string, number>;
  visitingDogIds: Set<string>;
  ancestorInbreedingDepth: number;
};

type InbreedingCalculationOptions = {
  ancestorInbreedingDepth?: number;
};

// v1 virtual pairing uses the selected SP only for pair occurrence discovery.
// Shared ancestors are adjusted by a previously stored 9-generation
// SIITOSASTE. v2 recalculates that value dynamically, but keeps the same fixed
// default depth so SP6 does not change ancestor Fa semantics.
function createCalculationContext(
  options: InbreedingCalculationOptions = {},
): InbreedingCalculationContext {
  return {
    dynamicInbreedingPctByDogId: new Map(),
    visitingDogIds: new Set(),
    ancestorInbreedingDepth:
      options.ancestorInbreedingDepth ?? INBREEDING_DEFAULT_ANCESTOR_FA_DEPTH,
  };
}

function getNode(ancestry: DogPedigreeAncestryDb, id: string) {
  return ancestry.nodes[id] ?? null;
}

function buildSideMatrix(
  ancestry: DogPedigreeAncestryDb,
  parentId: string,
  maxDepth: number,
): PedigreeMatrix {
  const matrix: PedigreeMatrix = { 1: { 1: parentId } };
  for (let generation = 2; generation <= maxDepth; generation++) {
    const previous = matrix[generation - 1] ?? {};
    const current: Record<number, string | null> = {};
    let nextIndex = 1;
    for (let i = 1; i <= 2 ** (generation - 2); i++) {
      const ancestorId = previous[i] ?? null;
      const ancestor = ancestorId ? getNode(ancestry, ancestorId) : null;
      current[nextIndex] = ancestor?.sireId ?? null;
      nextIndex += 1;
      current[nextIndex] = ancestor?.damId ?? null;
      nextIndex += 1;
    }
    matrix[generation] = current;
  }
  return matrix;
}

function buildSharedOccurrences(
  sire: PedigreeMatrix,
  dam: PedigreeMatrix,
  maxDepth: number,
): SharedOccurrence[] {
  const shared: SharedOccurrence[] = [];
  const sharedBySirePos: Record<string, string> = {};
  const sharedByDamPos: Record<string, string> = {};

  for (let sg = 1; sg <= maxDepth; sg++) {
    const sireRow = sire[sg] ?? {};
    for (let si = 1; si <= 2 ** (sg - 1); si++) {
      const sireId = sireRow[si];
      if (!sireId) {
        continue;
      }
      for (let dg = 1; dg <= maxDepth; dg++) {
        const damRow = dam[dg] ?? {};
        for (let di = 1; di <= 2 ** (dg - 1); di++) {
          if (sireId !== damRow[di]) {
            continue;
          }
          sharedBySirePos[`${sg}.${si}`] = sireId;
          sharedByDamPos[`${dg}.${di}`] = sireId;
          shared.push({
            id: sireId,
            sireGeneration: sg,
            sireIndex: si,
            damGeneration: dg,
            damIndex: di,
            contributionPct: Math.pow(0.5, sg + dg - 1) * 100,
            include: true,
          });
        }
      }
    }
  }

  for (const occurrence of shared) {
    const sirePath: string[] = [];
    const damPath: string[] = [];
    let sg = occurrence.sireGeneration - 1;
    let si = Math.round(occurrence.sireIndex / 2);
    while (sg >= 1) {
      const key = `${sg}.${si}`;
      const id = sharedBySirePos[key];
      if (id) sirePath.push(id);
      si = Math.round(si / 2);
      sg -= 1;
    }
    let dg = occurrence.damGeneration - 1;
    let di = Math.round(occurrence.damIndex / 2);
    while (dg >= 1) {
      const key = `${dg}.${di}`;
      const id = sharedByDamPos[key];
      if (id) damPath.push(id);
      di = Math.round(di / 2);
      dg -= 1;
    }
    if (
      sirePath.length > 0 &&
      damPath.length > 0 &&
      sirePath.some((id) => damPath.includes(id))
    ) {
      occurrence.include = false;
    }
  }

  return shared;
}

function sumInbreedingPct(
  shared: SharedOccurrence[],
  ancestry: DogPedigreeAncestryDb,
  context: InbreedingCalculationContext,
): number {
  const perAncestor: Record<string, number> = {};
  for (const occurrence of shared) {
    if (!occurrence.include) {
      continue;
    }
    perAncestor[occurrence.id] =
      (perAncestor[occurrence.id] ?? 0) + occurrence.contributionPct;
  }
  return Object.entries(perAncestor).reduce((sum, [ancestorId, fxPct]) => {
    return sum + fxPct * getAncestorMultiplier(ancestry, ancestorId, context);
  }, 0);
}

function getAncestorMultiplier(
  ancestry: DogPedigreeAncestryDb,
  ancestorId: string,
  context: InbreedingCalculationContext,
): number {
  const ancestorInbreedingPct = calculateDynamicInbreedingCoefficientPct(
    ancestorId,
    ancestry,
    context,
  );
  return 1 + ancestorInbreedingPct / 100;
}

function groupIncludedContributions(
  shared: SharedOccurrence[],
  ancestry: DogPedigreeAncestryDb,
  context: InbreedingCalculationContext,
): GroupedInbreedingContributionBreakdown[] {
  const grouped = new Map<string, GroupedInbreedingContributionBreakdown>();

  for (const occurrence of shared) {
    if (!occurrence.include) {
      continue;
    }

    const existing = grouped.get(occurrence.id);
    if (existing) {
      existing.rawContributionPct += occurrence.contributionPct;
      existing.occurrenceCount += 1;
      existing.adjustedContributionPct =
        existing.rawContributionPct *
        getAncestorMultiplier(ancestry, occurrence.id, context);
      continue;
    }

    const multiplier = getAncestorMultiplier(ancestry, occurrence.id, context);
    grouped.set(occurrence.id, {
      id: occurrence.id,
      rawContributionPct: occurrence.contributionPct,
      adjustedContributionPct: occurrence.contributionPct * multiplier,
      occurrenceCount: 1,
      sireGeneration: occurrence.sireGeneration,
      sireIndex: occurrence.sireIndex,
      damGeneration: occurrence.damGeneration,
      damIndex: occurrence.damIndex,
    });
  }

  return [...grouped.values()].sort(
    (left, right) =>
      right.adjustedContributionPct - left.adjustedContributionPct,
  );
}

function countKnownPedigreePct(
  sire: PedigreeMatrix,
  dam: PedigreeMatrix,
  maxDepth: number,
): { knownSlotCount: number; knownPedigreePct: number } {
  const totalSlotsPerSide = 2 ** maxDepth - 1;
  const countKnownSlots = (matrix: PedigreeMatrix): number =>
    Object.values(matrix).reduce(
      (sum, row) =>
        sum +
        Object.values(row).reduce((rowSum, id) => rowSum + (id ? 1 : 0), 0),
      0,
    );
  const knownSlotCount = countKnownSlots(sire) + countKnownSlots(dam);
  return {
    knownSlotCount,
    knownPedigreePct:
      totalSlotsPerSide <= 0
        ? 0
        : (knownSlotCount / (totalSlotsPerSide * 2)) * 100,
  };
}

function calculateDynamicInbreedingCoefficientPct(
  dogId: string,
  ancestry: DogPedigreeAncestryDb,
  context: InbreedingCalculationContext,
): number {
  const cached = context.dynamicInbreedingPctByDogId.get(dogId);
  if (cached != null) {
    return cached;
  }

  const dog = getNode(ancestry, dogId);
  if (!dog?.sireId || !dog?.damId || context.ancestorInbreedingDepth < 1) {
    context.dynamicInbreedingPctByDogId.set(dogId, 0);
    return 0;
  }

  if (context.visitingDogIds.has(dogId)) {
    return 0;
  }

  context.visitingDogIds.add(dogId);
  const inbreedingPct = calculateInbreedingCoefficientForParentsPctInternal(
    dog.sireId,
    dog.damId,
    ancestry,
    context.ancestorInbreedingDepth,
    context,
  );
  context.visitingDogIds.delete(dogId);
  context.dynamicInbreedingPctByDogId.set(dogId, inbreedingPct);
  return inbreedingPct;
}

export function calculateInbreedingCoefficientPct(
  dogId: string,
  ancestry: DogPedigreeAncestryDb,
  maxDepth = 9,
  options?: InbreedingCalculationOptions,
): number | null {
  const root = getNode(ancestry, dogId);
  if (!root?.sireId || !root?.damId) {
    return null;
  }
  if (maxDepth < 1) {
    return 0;
  }

  return calculateInbreedingCoefficientForParentsPct(
    root.sireId,
    root.damId,
    ancestry,
    maxDepth,
    options,
  );
}

function calculateInbreedingCoefficientForParentsPctInternal(
  sireId: string,
  damId: string,
  ancestry: DogPedigreeAncestryDb,
  maxDepth: number,
  context: InbreedingCalculationContext,
): number {
  const sireMatrix = buildSideMatrix(ancestry, sireId, maxDepth);
  const damMatrix = buildSideMatrix(ancestry, damId, maxDepth);
  const shared = buildSharedOccurrences(sireMatrix, damMatrix, maxDepth);
  return sumInbreedingPct(shared, ancestry, context);
}

export function calculateInbreedingCoefficientForParentsPct(
  sireId: string,
  damId: string,
  ancestry: DogPedigreeAncestryDb,
  maxDepth = 9,
  options?: InbreedingCalculationOptions,
): number {
  return calculateInbreedingCoefficientForParentsPctInternal(
    sireId,
    damId,
    ancestry,
    maxDepth,
    createCalculationContext(options),
  );
}

export function calculateInbreedingCoefficientBreakdownForParentsPct(
  sireId: string,
  damId: string,
  ancestry: DogPedigreeAncestryDb,
  maxDepth = 9,
  options?: InbreedingCalculationOptions,
): InbreedingCoefficientBreakdownPct {
  const context = createCalculationContext(options);
  const sireMatrix = buildSideMatrix(ancestry, sireId, maxDepth);
  const damMatrix = buildSideMatrix(ancestry, damId, maxDepth);
  const shared = buildSharedOccurrences(sireMatrix, damMatrix, maxDepth);
  const contributionPct = sumInbreedingPct(shared, ancestry, context);
  const includedOccurrences = shared.filter((occurrence) => occurrence.include);
  const contributions = groupIncludedContributions(shared, ancestry, context);
  const sharedAncestorCount = new Set(
    includedOccurrences.map((occurrence) => occurrence.id),
  ).size;
  const includedOccurrenceCount = includedOccurrences.length;
  const includedSirePositionCount = new Set(
    includedOccurrences.map(
      (occurrence) => `${occurrence.sireGeneration}-${occurrence.sireIndex}`,
    ),
  ).size;
  const includedDamPositionCount = new Set(
    includedOccurrences.map(
      (occurrence) => `${occurrence.damGeneration}-${occurrence.damIndex}`,
    ),
  ).size;
  const { knownSlotCount, knownPedigreePct } = countKnownPedigreePct(
    sireMatrix,
    damMatrix,
    maxDepth,
  );

  return {
    sharedAncestorCount,
    sharedOccurrenceCount: shared.length,
    includedOccurrenceCount,
    includedSirePositionCount,
    includedDamPositionCount,
    includedPositionCount: includedSirePositionCount + includedDamPositionCount,
    knownSlotCount,
    knownPedigreePct,
    contributionPct,
    contributions,
  };
}
