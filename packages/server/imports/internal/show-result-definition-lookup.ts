type DefinitionRow = {
  id: string;
  code: string;
};

// Shares definition-code matching rules between phase3 import writes and
// coverage/reporting so both paths interpret renamed canonical codes the same way.
const LEGACY_DEFINITION_CODE_ALIASES: Record<string, string[]> = {
  varaSERT: ["VARASERT"],
  "NORD-SERT": ["NORD_SERT"],
  "NORD-varaSERT": ["NORD_VARASERT"],
  varaCACIB: ["VARACACIB"],
  "CACIB-J": ["CACIB_J"],
  "CACIB-V": ["CACIB_V"],
  "JUN-SERT": ["JUN_SERT"],
  "VET-SERT": ["VET_SERT"],
  "LEGACY-LAATUARVOSTELU": ["LAATU_NUMERO"],
};

function normalizeDefinitionLookupKey(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9ÅÄÖ]/g, "");
}

function definitionLookupCandidates(code: string): string[] {
  const aliases = LEGACY_DEFINITION_CODE_ALIASES[code] ?? [];
  return [code, ...aliases];
}

export function buildDefinitionLookup(rows: DefinitionRow[]) {
  const definitionIdByCode = new Map(rows.map((row) => [row.code, row.id]));
  const definitionIdsByUpperCode = new Map<string, string[]>();
  const definitionIdsByNormalizedCode = new Map<string, string[]>();

  for (const row of rows) {
    const upperCode = row.code.toUpperCase();
    const upperIds = definitionIdsByUpperCode.get(upperCode) ?? [];
    upperIds.push(row.id);
    definitionIdsByUpperCode.set(upperCode, upperIds);

    const normalizedCode = normalizeDefinitionLookupKey(row.code);
    const normalizedIds =
      definitionIdsByNormalizedCode.get(normalizedCode) ?? [];
    normalizedIds.push(row.id);
    definitionIdsByNormalizedCode.set(normalizedCode, normalizedIds);
  }

  return {
    findDefinitionId(code: string): string | undefined {
      const lookupCandidates = definitionLookupCandidates(code);

      for (const candidate of lookupCandidates) {
        const exactMatch = definitionIdByCode.get(candidate);
        if (exactMatch) return exactMatch;

        const upperCodeMatches = definitionIdsByUpperCode.get(
          candidate.toUpperCase(),
        );
        if (upperCodeMatches?.length === 1) return upperCodeMatches[0];

        const normalizedCodeMatches = definitionIdsByNormalizedCode.get(
          normalizeDefinitionLookupKey(candidate),
        );
        if (normalizedCodeMatches?.length === 1) {
          return normalizedCodeMatches[0];
        }
      }

      return undefined;
    },
  };
}
