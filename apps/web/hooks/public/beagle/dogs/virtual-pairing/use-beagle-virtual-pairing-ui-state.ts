"use client";

import { useBeagleVirtualPairingCalculationState } from "./use-beagle-virtual-pairing-calculation-state";
import { useBeagleVirtualPairingSearchState } from "./use-beagle-virtual-pairing-search-state";

// Public virtual pairing state facade.
// Composes the search and calculation hooks into the page-facing UI contract.
export function useBeagleVirtualPairingUiState() {
  const searchState = useBeagleVirtualPairingSearchState();
  const calculationState = useBeagleVirtualPairingCalculationState();

  return {
    ...searchState,
    ...calculationState,
  };
}
