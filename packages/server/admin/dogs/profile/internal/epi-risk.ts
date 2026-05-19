import type { DogEpiDiseaseFactDb, DogPedigreeAncestryDb } from "@beagle/db";

type EpiEvidence = {
  text: string;
  value: number;
};

export type AdminDogEpiSummary = {
  epiLuku: number;
  epiTeksti: string;
  laforaLuku: number;
  epiRiskLuku: number;
};

function buildGenerationSlots(
  ancestry: DogPedigreeAncestryDb,
  rootDogId: string,
  maxDepth: number,
): Array<Array<string | null>> {
  const slots: Array<Array<string | null>> = [[rootDogId]];
  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const previous = slots[depth - 1] ?? [];
    const current: Array<string | null> = [];
    for (const dogId of previous) {
      if (!dogId) {
        current.push(null, null);
        continue;
      }
      const node = ancestry.nodes[dogId];
      current.push(node?.sireId ?? null, node?.damId ?? null);
    }
    slots.push(current);
  }
  return slots;
}

function scoreDogEpiEvidence(
  dogId: string | null,
  sireId: string | null,
  damId: string | null,
  epiRows: DogEpiDiseaseFactDb[],
  epiByDogId: Set<string>,
): EpiEvidence {
  if (!dogId) {
    return { text: "-----", value: 0 };
  }

  let text = "";
  let value = 0;

  const selfHasEpi = epiByDogId.has(dogId);
  text += selfHasEpi ? "I" : "-";
  value += selfHasEpi ? 1 : 0;

  const hasFullSiblingWithEpi = Boolean(
    sireId &&
    damId &&
    epiRows.find(
      (row) =>
        row.dogId !== dogId &&
        row.isaDogId === sireId &&
        row.emaDogId === damId,
    ),
  );
  text += hasFullSiblingWithEpi ? "S" : "-";
  value += hasFullSiblingWithEpi ? 0.5 : 0;

  const hasEpiParent = Boolean(
    (sireId && epiByDogId.has(sireId)) || (damId && epiByDogId.has(damId)),
  );
  text += hasEpiParent ? "V" : "-";
  value += hasEpiParent ? 0.5 : 0;

  const hasEpiOffspring = Boolean(
    epiRows.find((row) => row.isaDogId === dogId || row.emaDogId === dogId),
  );
  text += hasEpiOffspring ? "J" : "-";
  value += hasEpiOffspring ? 0.5 : 0;

  const hasHalfSiblingWithEpi = Boolean(
    epiRows.find((row) => {
      const sireMatch = Boolean(sireId && row.isaDogId === sireId);
      const damMatch = Boolean(damId && row.emaDogId === damId);
      return sireMatch !== damMatch;
    }),
  );
  text += hasHalfSiblingWithEpi ? "P" : "-";
  value += hasHalfSiblingWithEpi ? 0.25 : 0;

  return { text, value };
}

function toFiveDecimals(value: number): number {
  return Number(value.toFixed(5));
}

function laforaValueFromCode(code: string): number {
  if (code === "lepis") return 7;
  if (code === "lepik") return 3;
  if (code === "lepit") return -1;
  return 0;
}

function buildLaforaByDogId(rows: DogEpiDiseaseFactDb[]): Map<string, number> {
  const byDogId = new Map<string, number>();
  for (const row of rows) {
    if (!row.dogId) {
      continue;
    }
    const nextValue = laforaValueFromCode(row.sairausKoodi);
    const currentValue = byDogId.get(row.dogId);
    if (currentValue == null || nextValue > currentValue) {
      byDogId.set(row.dogId, nextValue);
    }
  }
  return byDogId;
}

function computeLaforaLuku(
  ancestry: DogPedigreeAncestryDb,
  rootDogId: string,
  laforaByDogId: Map<string, number>,
): number {
  const root = ancestry.nodes[rootDogId];
  const sireId = root?.sireId ?? null;
  const damId = root?.damId ?? null;

  const own = laforaByDogId.get(rootDogId) ?? 0;
  if (own !== 0) {
    return own;
  }

  const sireLafora = sireId ? (laforaByDogId.get(sireId) ?? 0) : 0;
  const damLafora = damId ? (laforaByDogId.get(damId) ?? 0) : 0;
  let lafora = (sireLafora + damLafora) * 0.5;

  const sireNode = sireId ? ancestry.nodes[sireId] : null;
  const damNode = damId ? ancestry.nodes[damId] : null;

  const sireSireLafora =
    sireLafora === 0 && sireNode?.sireId
      ? (laforaByDogId.get(sireNode.sireId) ?? 0)
      : 0;
  const sireDamLafora =
    sireLafora === 0 && sireNode?.damId
      ? (laforaByDogId.get(sireNode.damId) ?? 0)
      : 0;
  const damSireLafora =
    damLafora === 0 && damNode?.sireId
      ? (laforaByDogId.get(damNode.sireId) ?? 0)
      : 0;
  const damDamLafora =
    damLafora === 0 && damNode?.damId
      ? (laforaByDogId.get(damNode.damId) ?? 0)
      : 0;

  lafora +=
    (sireSireLafora + sireDamLafora + damSireLafora + damDamLafora) * 0.25;
  return lafora;
}

function computeEpiTier(epiLuku: number): 1 | 2 | 3 {
  if (epiLuku < 1) return 1;
  if (epiLuku <= 1.5) return 2;
  return 3;
}

function computeEpiRiskLuku(laforaLuku: number, epiTier: 1 | 2 | 3): number {
  const laf7 = new Set([5.25, 6.0]);
  const laf6 = new Set([3.25, 3.5, 4.0, 4.25, 5.0]);
  const laf5 = new Set([1.75, 2.0, 2.25, 2.5, 3.0]);
  const laf4 = new Set([0.5, 0.75, 1.0, 1.25, 1.5]);
  const laf3 = new Set([-0.5, -0.25, 0, 0.25]);

  if (laforaLuku === 7) return 8;
  if (laf7.has(laforaLuku)) return 7;
  if (laf6.has(laforaLuku) || epiTier === 3) return 6;
  if (laf5.has(laforaLuku) && epiTier < 3) return 5;
  if ((laf4.has(laforaLuku) && epiTier < 3) || epiTier === 2) return 4;
  if (laf3.has(laforaLuku) && epiTier === 1) return 3;
  if (laforaLuku === -0.75 && epiTier === 1) return 2;
  if (laforaLuku === -1 && epiTier === 1) return 1;
  return 3;
}

export function calculateAdminDogEpiSummary(
  rootDogId: string,
  ancestry: DogPedigreeAncestryDb,
  diseaseFacts: DogEpiDiseaseFactDb[],
): AdminDogEpiSummary {
  const epiRows = diseaseFacts.filter((row) => row.sairausKoodi === "epi");
  const epiByDogId = new Set(
    epiRows.map((row) => row.dogId).filter((id): id is string => Boolean(id)),
  );
  const laforaByDogId = buildLaforaByDogId(
    diseaseFacts.filter((row) => row.sairausKoodi !== "epi"),
  );

  const generations = buildGenerationSlots(ancestry, rootDogId, 5);

  let epiLuku = 0;
  const rootNode = ancestry.nodes[rootDogId];
  const rootEvidence = scoreDogEpiEvidence(
    rootDogId,
    rootNode?.sireId ?? null,
    rootNode?.damId ?? null,
    epiRows,
    epiByDogId,
  );
  epiLuku += rootEvidence.value;

  for (let depth = 1; depth <= 4; depth += 1) {
    const weight = Math.pow(0.5, depth);
    for (const dogId of generations[depth] ?? []) {
      if (!dogId) {
        continue;
      }
      const node = ancestry.nodes[dogId];
      const evidence = scoreDogEpiEvidence(
        dogId,
        node?.sireId ?? null,
        node?.damId ?? null,
        epiRows,
        epiByDogId,
      );
      epiLuku += evidence.value * weight;
    }
  }

  const roundedEpiLuku = toFiveDecimals(epiLuku);
  const laforaLuku = computeLaforaLuku(ancestry, rootDogId, laforaByDogId);
  const epiRiskLuku = computeEpiRiskLuku(
    laforaLuku,
    computeEpiTier(roundedEpiLuku),
  );

  return {
    epiLuku: roundedEpiLuku,
    epiTeksti: rootEvidence.text,
    laforaLuku,
    epiRiskLuku,
  };
}
