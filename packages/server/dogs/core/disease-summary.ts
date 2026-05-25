import type { DogEpiDiseaseFactDb, DogPedigreeAncestryDb } from "@beagle/db";

// Shared legacy health calculator for admin profile and virtual pairing.
// It derives all values from current pedigree and disease rows and never reads
// stored legacy health percentages from the database.
type DiseaseEvidence = {
  text: string;
  value: number;
};

const EPI_DISEASE_CODES = new Set(["epi"]);
const LAFORA_DISEASE_CODES = new Set(["lepis", "lepik", "lepit"]);
const PUR_DISEASE_CODES = new Set(["pur", "ap", "yp", "rp"]);
const FIVE_GENERATION_DEPTH = 5;

export type DogHealthTextEvidence = {
  value: number;
  text: string;
  display: string;
};

export type DogHealthTieredEvidence = DogHealthTextEvidence & {
  tier: 1 | 2 | 3;
};

export type DogHealthSummary = {
  epi: DogHealthTieredEvidence;
  lafora: {
    value: number;
    display: string;
  };
  risk: {
    value: number;
    display: string;
  };
  pur: DogHealthTextEvidence;
};

export type DogEpiSummary = {
  epiLuku: number;
  epiTeksti: string;
  laforaLuku: number;
  epiRiskLuku: number;
};

function roundTo(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}

function formatDisplayValue(
  value: number,
  decimals: number,
  text?: string,
): string {
  const formatted = value.toFixed(decimals);
  return text ? `${formatted} ${text}` : formatted;
}

function getNode(
  ancestry: DogPedigreeAncestryDb,
  dogId: string,
): DogPedigreeAncestryDb["nodes"][string] | null {
  return ancestry.nodes[dogId] ?? null;
}

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
      const node = getNode(ancestry, dogId);
      current.push(node?.sireId ?? null, node?.damId ?? null);
    }
    slots.push(current);
  }
  return slots;
}

// Returns the legacy five-position evidence string used by the old EPI/PUR
// screens. The score is intentionally asymmetric:
// - self counts as 1.0
// - full sibling, parent, and offspring evidence count as 0.5
// - half-sibling evidence counts as 0.25
function scoreDiseaseEvidence(
  dogId: string | null,
  sireId: string | null,
  damId: string | null,
  diseaseRows: DogEpiDiseaseFactDb[],
  diseaseByDogId: Set<string>,
): DiseaseEvidence {
  if (!dogId) {
    return { text: "-----", value: 0 };
  }

  let text = "";
  let value = 0;

  const hasSelf = diseaseByDogId.has(dogId);
  text += hasSelf ? "I" : "-";
  value += hasSelf ? 1 : 0;

  const hasFullSibling = Boolean(
    sireId &&
    damId &&
    diseaseRows.find(
      (row) =>
        row.dogId !== dogId &&
        row.isaDogId === sireId &&
        row.emaDogId === damId,
    ),
  );
  text += hasFullSibling ? "S" : "-";
  value += hasFullSibling ? 0.5 : 0;

  const hasParent = Boolean(
    (sireId && diseaseByDogId.has(sireId)) ||
    (damId && diseaseByDogId.has(damId)),
  );
  text += hasParent ? "V" : "-";
  value += hasParent ? 0.5 : 0;

  const hasOffspring = Boolean(
    diseaseRows.find((row) => row.isaDogId === dogId || row.emaDogId === dogId),
  );
  text += hasOffspring ? "J" : "-";
  value += hasOffspring ? 0.5 : 0;

  const hasHalfSibling = Boolean(
    diseaseRows.find((row) => {
      const sireMatch = Boolean(sireId && row.isaDogId === sireId);
      const damMatch = Boolean(damId && row.emaDogId === damId);
      return sireMatch !== damMatch;
    }),
  );
  text += hasHalfSibling ? "P" : "-";
  value += hasHalfSibling ? 0.25 : 0;

  return { text, value };
}

// Expands the root dog to five generations and applies the legacy weighted
// disease evidence model:
// - generation 0 root evidence counts at full weight
// - generations 1-4 count at 1/2, 1/4, 1/8, and 1/16
function scoreFiveGenerationDiseaseEvidence(
  rootDogId: string,
  ancestry: DogPedigreeAncestryDb,
  diseaseRows: DogEpiDiseaseFactDb[],
): DiseaseEvidence {
  const diseaseByDogId = new Set(
    diseaseRows
      .map((row) => row.dogId)
      .filter((id): id is string => Boolean(id)),
  );
  const generations = buildGenerationSlots(
    ancestry,
    rootDogId,
    FIVE_GENERATION_DEPTH,
  );
  const rootNode = getNode(ancestry, rootDogId);

  let value = 0;
  const rootEvidence = scoreDiseaseEvidence(
    rootDogId,
    rootNode?.sireId ?? null,
    rootNode?.damId ?? null,
    diseaseRows,
    diseaseByDogId,
  );
  value += rootEvidence.value;

  for (let depth = 1; depth <= 4; depth += 1) {
    const weight = Math.pow(0.5, depth);
    for (const dogId of generations[depth] ?? []) {
      if (!dogId) {
        continue;
      }
      const node = getNode(ancestry, dogId);
      const evidence = scoreDiseaseEvidence(
        dogId,
        node?.sireId ?? null,
        node?.damId ?? null,
        diseaseRows,
        diseaseByDogId,
      );
      value += evidence.value * weight;
    }
  }

  return {
    text: rootEvidence.text,
    value: roundTo(value, 5),
  };
}

// Returns the dog ids needed to evaluate the fixed five-generation health
// model. Generation 5 is included for parent/sibling evidence of generation 4,
// but health scoring itself remains root plus generations 1-4.
export function getDogHealthDiseaseFactDogIds(
  rootDogId: string,
  ancestry: DogPedigreeAncestryDb,
): string[] {
  const generations = buildGenerationSlots(
    ancestry,
    rootDogId,
    FIVE_GENERATION_DEPTH,
  );
  const ids = new Set<string>();

  for (const generation of generations) {
    for (const dogId of generation) {
      if (dogId) {
        ids.add(dogId);
      }
    }
  }

  return [...ids];
}

function laforaValueFromCode(code: string): number {
  if (code === "lepis") return 7;
  if (code === "lepik") return 3;
  if (code === "lepit") return -1;
  return 0;
}

// Picks the strongest Lafora value found for each dog, then derives the final
// score from the root dog's own value or from selected sire/dam/grandparent
// evidence when the root dog itself has no direct Lafora code.
function buildLaforaByDogId(rows: DogEpiDiseaseFactDb[]): Map<string, number> {
  const byDogId = new Map<string, number>();
  for (const row of rows) {
    if (!row.dogId || !LAFORA_DISEASE_CODES.has(row.sairausKoodi)) {
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

// Legacy Lafora lookup:
// - the root dog's own code wins immediately
// - otherwise the score is influenced by sire/dam and the four grandparent
//   positions that were used by the old hallinta logic
function computeLaforaLuku(
  ancestry: DogPedigreeAncestryDb,
  rootDogId: string,
  laforaByDogId: Map<string, number>,
): number {
  const root = getNode(ancestry, rootDogId);
  const sireId = root?.sireId ?? null;
  const damId = root?.damId ?? null;

  const own = laforaByDogId.get(rootDogId) ?? 0;
  if (own !== 0) {
    return own;
  }

  const sireLafora = sireId ? (laforaByDogId.get(sireId) ?? 0) : 0;
  const damLafora = damId ? (laforaByDogId.get(damId) ?? 0) : 0;
  let lafora = (sireLafora + damLafora) * 0.5;

  const sireNode = sireId ? getNode(ancestry, sireId) : null;
  const damNode = damId ? getNode(ancestry, damId) : null;

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
  return roundTo(lafora, 5);
}

// Maps the rounded EPI score into the legacy three-class flag tier.
function computeEpiTier(epiLuku: number): 1 | 2 | 3 {
  if (epiLuku < 1) return 1;
  if (epiLuku <= 1.5) return 2;
  return 3;
}

// Legacy risk lookup that combines Lafora and EPI tier into the old 1-8 scale.
// The sets below mirror the historical bucket values from v1.
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

function filterDiseaseRows(
  diseaseFacts: DogEpiDiseaseFactDb[],
  codes: Set<string>,
): DogEpiDiseaseFactDb[] {
  return diseaseFacts.filter((row) => codes.has(row.sairausKoodi));
}

// Formats one legacy disease summary as a three-decimal display value plus the
// five-character evidence string, matching the old hallinta presentation.
function toTextEvidence(
  diseaseFacts: DogEpiDiseaseFactDb[],
  rootDogId: string,
  ancestry: DogPedigreeAncestryDb,
  codes: Set<string>,
): DogHealthTextEvidence {
  const rows = filterDiseaseRows(diseaseFacts, codes);
  const evidence = scoreFiveGenerationDiseaseEvidence(
    rootDogId,
    ancestry,
    rows,
  );
  return {
    value: evidence.value,
    text: evidence.text,
    display: formatDisplayValue(evidence.value, 3, evidence.text),
  };
}

// Primary shared calculator used by admin profile and virtual pairing.
// Returns display-ready health diagnostics derived from current data only.
export function calculateDogHealthSummary(
  rootDogId: string,
  ancestry: DogPedigreeAncestryDb,
  diseaseFacts: DogEpiDiseaseFactDb[],
): DogHealthSummary {
  const epiEvidence = toTextEvidence(
    diseaseFacts,
    rootDogId,
    ancestry,
    EPI_DISEASE_CODES,
  );
  const purEvidence = toTextEvidence(
    diseaseFacts,
    rootDogId,
    ancestry,
    PUR_DISEASE_CODES,
  );

  const laforaByDogId = buildLaforaByDogId(diseaseFacts);
  const laforaLuku = computeLaforaLuku(ancestry, rootDogId, laforaByDogId);
  const epiTier = computeEpiTier(epiEvidence.value);
  const epiRiskLuku = computeEpiRiskLuku(laforaLuku, epiTier);

  return {
    epi: {
      value: epiEvidence.value,
      text: epiEvidence.text,
      display: formatDisplayValue(epiEvidence.value, 3, epiEvidence.text),
      tier: epiTier,
    },
    lafora: {
      value: laforaLuku,
      display: String(laforaLuku),
    },
    risk: {
      value: epiRiskLuku,
      display: String(epiRiskLuku),
    },
    pur: {
      value: purEvidence.value,
      text: purEvidence.text,
      display: formatDisplayValue(purEvidence.value, 3, purEvidence.text),
    },
  };
}

// Backwards-compatible adapter for the older admin profile DTO shape.
export function calculateDogEpiSummary(
  rootDogId: string,
  ancestry: DogPedigreeAncestryDb,
  diseaseFacts: DogEpiDiseaseFactDb[],
): DogEpiSummary {
  const summary = calculateDogHealthSummary(rootDogId, ancestry, diseaseFacts);
  return {
    epiLuku: summary.epi.value,
    epiTeksti: summary.epi.text,
    laforaLuku: summary.lafora.value,
    epiRiskLuku: summary.risk.value,
  };
}
