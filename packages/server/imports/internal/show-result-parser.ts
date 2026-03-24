import { normalizeShowResult } from "../../shows/core";
import {
  CLASS_ALIASES,
  CLASS_CODES,
  FLAG_TOKEN_CODES,
  QUALITY_BY_DIGIT,
  QUALITY_CODES,
  TOKEN_ALIAS_TO_CANONICAL,
} from "./show-result-tokens";

const LEGACY_QUALITY_DIGIT_DEFINITION_CODE = "LEGACY-LAATUARVOSTELU";

type ParsedShowResultItem = {
  definitionCode: string;
  valueCode: string | null;
  valueNumeric: number | null;
  isAwarded: boolean | null;
  token: string;
};

export type ParsedShowResultFormatNote = {
  code: string;
  message: string;
  token: string;
  eventDateIsoDate: string;
  className: string;
  qualityGrade: string;
  legacyQualityDigit: number;
};

export type ParsedShowResult = {
  normalizedResultText: string | null;
  tokens: string[];
  className: string | null;
  qualityGrade: string | null;
  placement: string | null;
  items: ParsedShowResultItem[];
  unmappedTokens: string[];
  formatNotes: ParsedShowResultFormatNote[];
};

function stripToken(value: string): string {
  return value.toUpperCase().replace(/[^A-ZÅÄÖ0-9]/g, "");
}

function normalizeClassCode(raw: string): string | null {
  return CLASS_ALIASES[raw.toUpperCase()] ?? null;
}

function splitCompoundToken(token: string): string[] {
  const patterns = [
    /^([A-ZÅÄÖ]{2,4}\d)([A-ZÅÄÖ]{2,4}K\d)$/i,
    /^([A-ZÅÄÖ]{2,4}\d)([A-ZÅÄÖ]{2,4}\d)$/i,
    /^([A-ZÅÄÖ]{2,4}K\d)([A-ZÅÄÖ]{2,4}K\d)$/i,
    /^((?:PU|PN)\d+)(ROP|VSP|SA|KP)$/i,
    /^([A-ZÅÄÖ]{2,4}K\d)(KP|SA)$/i,
    /^((?:PU|PN)\d+)([A-Z]{2}\d+\/\d{2,4})$/i,
  ];
  for (const pattern of patterns) {
    const match = token.match(pattern);
    if (match?.[1] && match?.[2]) return [match[1], match[2]];
  }
  return [token];
}

function tokenizeResult(value: string): string[] {
  return value
    .replace(/[;|]+/g, ",")
    .replace(/[.]+/g, " ")
    .replace(/[+]+/g, " ")
    .split(",")
    .flatMap((segment) => segment.split(/\s+/))
    .flatMap((token) => splitCompoundToken(token))
    .map((token) =>
      token.trim().replace(/^[^A-Za-zÅÄÖ0-9]+|[^A-Za-zÅÄÖ0-9]+$/g, ""),
    )
    .filter((token) => token.length > 0);
}

function parseClassPlacementToken(token: string): {
  className: string;
  placement: string;
} | null {
  const upper = token.toUpperCase();
  const direct = upper.match(
    /^(JUK|NUK|AVK|KÄK|KAK|VEK|VAK|VAKL|VALK|AVOK)(\d)$/,
  );
  if (direct?.[1] && direct?.[2]) {
    const prefixMap: Record<string, string> = {
      JUK: "JUN",
      NUK: "NUO",
      AVK: "AVO",
      AVOK: "AVO",
      KÄK: "KÄY",
      KAK: "KÄY",
      VEK: "VET",
      VAK: "VAL",
      VAKL: "VAL",
      VALK: "VAL",
    };
    return { className: prefixMap[direct[1]], placement: direct[2] };
  }

  const generic = upper.match(/^([A-ZÅÄÖ]{2,4})K(\d)$/);
  if (!generic?.[1] || !generic?.[2]) return null;
  const className = normalizeClassCode(generic[1]);
  if (!className) return null;
  return { className, placement: generic[2] };
}

function parseClassPlacementWithoutKToken(token: string): {
  className: string;
  placement: string;
} | null {
  const upper = token.toUpperCase();
  const match = upper.match(/^([A-ZÅÄÖ]{2,4})(0)$/);
  if (!match?.[1] || !match?.[2]) return null;
  const className = normalizeClassCode(match[1]);
  if (!className) return null;
  return { className, placement: match[2] };
}

function parseLegacyClassQualityToken(token: string): {
  className: string;
  qualityGrade: string;
  legacyQualityDigit: number;
} | null {
  const match = token.toUpperCase().match(/^([A-ZÅÄÖ]{2,4})([1-6])$/);
  if (!match?.[1] || !match?.[2]) return null;
  const className = normalizeClassCode(match[1]);
  const qualityGrade = QUALITY_BY_DIGIT[match[2]];
  if (!className || !qualityGrade) return null;
  return {
    className,
    qualityGrade,
    legacyQualityDigit: Number(match[2]),
  };
}

function parseQualityPlacementToken(token: string): {
  qualityGrade: string;
  placement: string;
} | null {
  const match = token.toUpperCase().match(/^(ERI|EH|H|T|EVA|HYL)(\d)$/);
  if (!match?.[1] || !match?.[2]) return null;
  return { qualityGrade: match[1], placement: match[2] };
}

function canonicalizeAwardToken(token: string): string | null {
  const stripped = stripToken(token);
  for (const canonicalCode of FLAG_TOKEN_CODES) {
    if (stripToken(canonicalCode) === stripped) return canonicalCode;
  }

  const upper = token.toUpperCase();
  if (QUALITY_CODES.has(upper)) return upper;
  if (/^(PU|PN)\d+$/.test(upper)) return "PUPN";

  const classQuality = upper.match(/^([A-ZÅÄÖ]{2,4})-(ERI|EH|H|T|EVA|HYL)$/);
  if (classQuality?.[2]) return classQuality[2];

  const qualityPlacement = parseQualityPlacementToken(upper);
  if (qualityPlacement) return qualityPlacement.qualityGrade;

  return TOKEN_ALIAS_TO_CANONICAL[stripped] ?? null;
}

function dedupeParsedItems(
  items: ParsedShowResultItem[],
): ParsedShowResultItem[] {
  const seen = new Set<string>();
  const deduped: ParsedShowResultItem[] = [];
  for (const item of items) {
    const key = `${item.definitionCode}|${item.valueCode ?? ""}|${item.valueNumeric ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }
  return deduped;
}

export function parseShowResultText(
  rawResultText: string | null,
  eventDateIsoDate: string,
): ParsedShowResult {
  const allowLegacyClassQuality = eventDateIsoDate >= "2003-01-01";
  const rawTokens = rawResultText ? tokenizeResult(rawResultText) : [];
  const normalizedResultText = normalizeShowResult(
    rawResultText,
    eventDateIsoDate,
  );
  const tokens = normalizedResultText
    ? tokenizeResult(normalizedResultText)
    : [];

  const classQualityMatch = normalizedResultText
    ? normalizedResultText.match(
        /\b(PEN|JUN|NUO|AVO|KÄY|KAY|VAL|VET)[-\s]+(ERI|EH|H|T|EVA|HYL)\b/i,
      )
    : null;

  let className = classQualityMatch?.[1]
    ? normalizeClassCode(classQualityMatch[1])
    : null;
  let qualityGrade = classQualityMatch?.[2]?.toUpperCase() ?? null;
  let placement: string | null = null;
  const unmappedTokens: string[] = [];
  const items: ParsedShowResultItem[] = [];
  const formatNotes: ParsedShowResultFormatNote[] = [];

  for (const token of tokens) {
    const upperToken = token.toUpperCase();
    let handled = false;

    if (CLASS_CODES.has(upperToken)) {
      className = className ?? normalizeClassCode(upperToken);
      handled = true;
    }

    const classAlias = normalizeClassCode(upperToken);
    if (classAlias) {
      className = className ?? classAlias;
      handled = true;
    }

    const classPlacement = parseClassPlacementToken(upperToken);
    if (classPlacement) {
      className = className ?? classPlacement.className;
      placement = placement ?? classPlacement.placement;
      handled = true;
    }

    const classPlacementNoK = parseClassPlacementWithoutKToken(upperToken);
    if (classPlacementNoK) {
      className = className ?? classPlacementNoK.className;
      placement = placement ?? classPlacementNoK.placement;
      handled = true;
    }

    if (allowLegacyClassQuality && !classPlacement) {
      const legacyClassQuality = parseLegacyClassQualityToken(upperToken);
      if (legacyClassQuality) {
        className = className ?? legacyClassQuality.className;
        qualityGrade = qualityGrade ?? legacyClassQuality.qualityGrade;
        items.push({
          definitionCode: legacyClassQuality.qualityGrade,
          valueCode: null,
          valueNumeric: null,
          isAwarded: true,
          token: upperToken,
        });
        handled = true;
      }
    } else if (!classPlacement) {
      const legacyClassQuality = parseLegacyClassQualityToken(upperToken);
      if (legacyClassQuality) {
        className = className ?? legacyClassQuality.className;
        items.push({
          definitionCode: LEGACY_QUALITY_DIGIT_DEFINITION_CODE,
          valueCode: null,
          valueNumeric: legacyClassQuality.legacyQualityDigit,
          isAwarded: null,
          token: upperToken,
        });
        handled = true;
      }
    }

    const qualityPlacement = parseQualityPlacementToken(upperToken);
    if (qualityPlacement) {
      qualityGrade = qualityGrade ?? qualityPlacement.qualityGrade;
      placement = placement ?? qualityPlacement.placement;
      items.push({
        definitionCode: qualityPlacement.qualityGrade,
        valueCode: null,
        valueNumeric: null,
        isAwarded: true,
        token: upperToken,
      });
      handled = true;
    }

    const definitionCode = canonicalizeAwardToken(upperToken);
    if (definitionCode) {
      items.push({
        definitionCode,
        valueCode: definitionCode === "PUPN" ? upperToken : null,
        valueNumeric: null,
        isAwarded: definitionCode === "PUPN" ? null : true,
        token: upperToken,
      });
      handled = true;
    }

    if (!handled) unmappedTokens.push(upperToken);
  }

  for (const token of rawTokens) {
    const legacyClassQuality = parseLegacyClassQualityToken(token);
    if (!allowLegacyClassQuality || !legacyClassQuality) continue;
    formatNotes.push({
      code: "SHOW_RESULT_LAATUARVOSTELU_FORMAT_CHANGED",
      message: `Legacy laatuarvostelu token ${token.toUpperCase()} was normalized to modern quality ${legacyClassQuality.qualityGrade} because event date ${eventDateIsoDate} is 2003-01-01 or later.`,
      token: token.toUpperCase(),
      eventDateIsoDate,
      className: legacyClassQuality.className,
      qualityGrade: legacyClassQuality.qualityGrade,
      legacyQualityDigit: legacyClassQuality.legacyQualityDigit,
    });
  }

  if (placement !== null && /^\d+$/.test(placement)) {
    items.push({
      definitionCode: "SIJOITUS",
      valueCode: null,
      valueNumeric: Number(placement),
      isAwarded: null,
      token: "SIJOITUS",
    });
  }

  if (className) {
    items.push({
      definitionCode: className,
      valueCode: null,
      valueNumeric: null,
      isAwarded: true,
      token: "CLASS",
    });
  }

  if (qualityGrade) {
    items.push({
      definitionCode: qualityGrade,
      valueCode: null,
      valueNumeric: null,
      isAwarded: true,
      token: "QUALITY",
    });
  }

  return {
    normalizedResultText,
    tokens,
    className,
    qualityGrade,
    placement,
    items: dedupeParsedItems(items),
    unmappedTokens: [...new Set(unmappedTokens)],
    formatNotes: dedupeFormatNotes(formatNotes),
  };
}

function dedupeFormatNotes(
  notes: ParsedShowResultFormatNote[],
): ParsedShowResultFormatNote[] {
  const seen = new Set<string>();
  const deduped: ParsedShowResultFormatNote[] = [];
  for (const note of notes) {
    const key = `${note.code}|${note.token}|${note.eventDateIsoDate}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(note);
  }
  return deduped;
}
