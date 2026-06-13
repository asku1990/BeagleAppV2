export const PUBLIC_VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH = 9;
export const PUBLIC_VIRTUAL_PAIRING_MIN_GENERATION_DEPTH = 4;
export const PUBLIC_VIRTUAL_PAIRING_MAX_GENERATION_DEPTH = 12;

type SearchParamsLike = {
  get: (key: string) => string | null;
};

export type PublicVirtualPairingUrlState = {
  sireRegistrationNo: string;
  damRegistrationNo: string;
  generationDepth: number;
};

function trimValue(value: string | null): string {
  return (value ?? "").trim();
}

function clampGenerationDepth(value: number): number {
  return Math.min(
    PUBLIC_VIRTUAL_PAIRING_MAX_GENERATION_DEPTH,
    Math.max(PUBLIC_VIRTUAL_PAIRING_MIN_GENERATION_DEPTH, value),
  );
}

export function readPublicVirtualPairingGenerationDepth(
  value: string | null,
): number {
  if (!value) {
    return PUBLIC_VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return PUBLIC_VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH;
  }

  return clampGenerationDepth(parsed);
}

export function readPublicVirtualPairingUrlState(
  params: SearchParamsLike,
): PublicVirtualPairingUrlState {
  return {
    sireRegistrationNo: trimValue(params.get("sire")),
    damRegistrationNo: trimValue(params.get("dam")),
    generationDepth: readPublicVirtualPairingGenerationDepth(params.get("sp")),
  };
}

export function toPublicVirtualPairingQueryString(
  state: PublicVirtualPairingUrlState,
) {
  const params = new URLSearchParams();

  params.set("sire", state.sireRegistrationNo);
  params.set("dam", state.damRegistrationNo);
  params.set("sp", String(clampGenerationDepth(state.generationDepth)));

  return params.toString();
}

export function toPublicVirtualPairingQueryHref(
  pathname: string,
  state: PublicVirtualPairingUrlState,
): string {
  const query = toPublicVirtualPairingQueryString(state);
  return query ? `${pathname}?${query}` : pathname;
}
