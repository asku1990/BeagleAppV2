export const VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH = 9;
export const VIRTUAL_PAIRING_MIN_GENERATION_DEPTH = 4;
export const VIRTUAL_PAIRING_MAX_GENERATION_DEPTH = 12;

type SearchParamsLike = {
  get: (key: string) => string | null;
};

export type VirtualPairingUrlState = {
  sireRegistrationNo: string;
  damRegistrationNo: string;
  generationDepth: number;
};

function trimValue(value: string | null): string {
  return (value ?? "").trim();
}

function clampGenerationDepth(value: number): number {
  return Math.min(
    VIRTUAL_PAIRING_MAX_GENERATION_DEPTH,
    Math.max(VIRTUAL_PAIRING_MIN_GENERATION_DEPTH, value),
  );
}

export function readVirtualPairingGenerationDepth(
  value: string | null,
): number {
  if (!value) {
    return VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH;
  }

  return clampGenerationDepth(parsed);
}

export function readVirtualPairingUrlState(
  params: SearchParamsLike,
): VirtualPairingUrlState {
  return {
    sireRegistrationNo: trimValue(params.get("sire")),
    damRegistrationNo: trimValue(params.get("dam")),
    generationDepth: readVirtualPairingGenerationDepth(params.get("sp")),
  };
}

export function toVirtualPairingQueryString(state: VirtualPairingUrlState) {
  const params = new URLSearchParams();

  params.set("sire", state.sireRegistrationNo);
  params.set("dam", state.damRegistrationNo);
  params.set("sp", String(clampGenerationDepth(state.generationDepth)));

  return params.toString();
}

export function toVirtualPairingQueryHref(
  pathname: string,
  state: VirtualPairingUrlState,
): string {
  const query = toVirtualPairingQueryString(state);
  return query ? `${pathname}?${query}` : pathname;
}
