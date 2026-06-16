"use client";

import { FeatureHeroHeader } from "@/components/layout";
import { useBeagleVirtualPairingUiState } from "@/hooks/public/beagle/dogs/virtual-pairing";
import { VirtualPairingResultPanel } from "./internal/virtual-pairing-result-panel";
import { VirtualPairingSearchPanel } from "./internal/virtual-pairing-search-panel";
import { VirtualPairingSelectionPanel } from "./internal/virtual-pairing-selection-panel";

export function BeagleVirtualPairingPage() {
  const {
    t,
    searchField,
    searchText,
    searchResult,
    hasCommittedSearch,
    isSearchPending,
    isSearchLoading,
    isSearchError,
    searchErrorMessage,
    canSubmit,
    selectedSire,
    selectedDam,
    generationDepth,
    isCalculating,
    canCalculate,
    selectionMessage,
    calculationMessage,
    calculationResult,
    showPositions,
    onSearchFieldChange,
    onSearchTextChange,
    onSearchSubmit,
    onSelectSire,
    onSelectDam,
    onClearSire,
    onClearDam,
    onGenerationDepthChange,
    onCalculate,
    onShowPositionsChange,
  } = useBeagleVirtualPairingUiState();

  return (
    <div className="space-y-6">
      <FeatureHeroHeader
        logoAlt={t("beagle.virtualPairing.page.logoAlt")}
        title={t("beagle.virtualPairing.page.title")}
        description={t("beagle.virtualPairing.page.description")}
      />

      <div className="space-y-6">
        <VirtualPairingSearchPanel
          t={t}
          field={searchField}
          query={searchText}
          isPending={isSearchPending}
          canSubmit={canSubmit}
          results={searchResult}
          hasCommittedSearch={hasCommittedSearch}
          isLoading={isSearchLoading}
          isError={isSearchError}
          errorMessage={searchErrorMessage}
          onFieldChange={onSearchFieldChange}
          onQueryChange={onSearchTextChange}
          onSubmit={onSearchSubmit}
          onSelectSire={onSelectSire}
          onSelectDam={onSelectDam}
        />

        <VirtualPairingSelectionPanel
          t={t}
          sire={selectedSire}
          dam={selectedDam}
          generationDepth={generationDepth}
          isCalculating={isCalculating}
          canCalculate={canCalculate}
          selectionMessage={selectionMessage}
          calculationMessage={calculationMessage}
          onClearSire={onClearSire}
          onClearDam={onClearDam}
          onGenerationDepthChange={onGenerationDepthChange}
          onCalculate={onCalculate}
        />

        <VirtualPairingResultPanel
          t={t}
          result={calculationResult}
          showPositions={showPositions}
          onShowPositionsChange={onShowPositionsChange}
        />
      </div>
    </div>
  );
}
