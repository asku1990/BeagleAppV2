"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  CalculatePublicVirtualPairingResponse,
  VirtualPairingDogOption,
  VirtualPairingSearchField,
  VirtualPairingSearchRequest,
} from "@beagle/contracts";
import { FeatureHeroHeader } from "@/components/layout";
import { useI18n } from "@/hooks/i18n";
import {
  PUBLIC_VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH,
  readPublicVirtualPairingUrlState,
  toPublicVirtualPairingQueryHref,
} from "@/lib/public/beagle/dogs/virtual-pairing";
import {
  useCalculatePublicVirtualPairingMutation,
  usePublicVirtualPairingSearchQuery,
} from "@/queries/public/beagle/dogs/virtual-pairing";
import { VirtualPairingResultPanel } from "./internal/virtual-pairing-result-panel";
import { VirtualPairingSearchPanel } from "./internal/virtual-pairing-search-panel";
import { VirtualPairingSelectionPanel } from "./internal/virtual-pairing-selection-panel";

function isValidSire(candidate: VirtualPairingDogOption): boolean {
  return candidate.sex === "U";
}

function isValidDam(candidate: VirtualPairingDogOption): boolean {
  return candidate.sex === "N";
}

export function BeagleVirtualPairingPage() {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lastAutoLoadKeyRef = useRef<string | null>(null);
  const activeCalculationRequestIdRef = useRef(0);
  const pendingUrlResetTokenRef = useRef(0);
  const [searchField, setSearchField] =
    useState<VirtualPairingSearchField>("name");
  const [searchText, setSearchText] = useState("");
  const [submittedSearch, setSubmittedSearch] =
    useState<VirtualPairingSearchRequest | null>(null);
  const [selectedSire, setSelectedSire] =
    useState<VirtualPairingDogOption | null>(null);
  const [selectedDam, setSelectedDam] =
    useState<VirtualPairingDogOption | null>(null);
  const [generationDepth, setGenerationDepth] = useState(
    String(PUBLIC_VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH),
  );
  const [selectionMessage, setSelectionMessage] = useState<string | null>(null);
  const [calculationMessage, setCalculationMessage] = useState<string | null>(
    null,
  );
  const [calculationResult, setCalculationResult] =
    useState<CalculatePublicVirtualPairingResponse | null>(null);
  const [showPositions, setShowPositions] = useState(false);

  const searchFilters = useMemo(
    () =>
      submittedSearch ?? {
        field: searchField,
        query: "",
        page: 1,
        pageSize: 10,
      },
    [searchField, submittedSearch],
  );
  const searchEnabled = Boolean(submittedSearch?.query.trim().length);
  const searchQuery = usePublicVirtualPairingSearchQuery(
    searchFilters,
    searchEnabled,
  );
  const calculateMutation = useCalculatePublicVirtualPairingMutation();
  const { mutateAsync: calculateAsync, isPending: isCalculating } =
    calculateMutation;
  const urlState = useMemo(
    () => readPublicVirtualPairingUrlState(searchParams),
    [searchParams],
  );
  const urlCalculationKey = useMemo(() => {
    if (!urlState.sireRegistrationNo || !urlState.damRegistrationNo) {
      return null;
    }

    return `${urlState.sireRegistrationNo}|${urlState.damRegistrationNo}|${urlState.generationDepth}`;
  }, [
    urlState.damRegistrationNo,
    urlState.generationDepth,
    urlState.sireRegistrationNo,
  ]);
  const canCalculate = Boolean(selectedSire && selectedDam) && !isCalculating;
  const searchResult = searchQuery.data ?? null;

  const clearUrlState = () => {
    router.replace(pathname);
  };

  const queueUrlBackedCalculationStateReset = useCallback(
    (generationDepthValue: string) => {
      const token = ++pendingUrlResetTokenRef.current;
      void Promise.resolve().then(() => {
        if (pendingUrlResetTokenRef.current !== token) {
          return;
        }

        setSelectedSire(null);
        setSelectedDam(null);
        setGenerationDepth(generationDepthValue);
        setSelectionMessage(null);
        setCalculationMessage(null);
        setCalculationResult(null);
      });
    },
    [],
  );

  useEffect(() => {
    if (!urlCalculationKey) {
      if (lastAutoLoadKeyRef.current != null) {
        lastAutoLoadKeyRef.current = null;
        activeCalculationRequestIdRef.current += 1;
        queueUrlBackedCalculationStateReset(
          String(PUBLIC_VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH),
        );
      }
      return;
    }

    if (lastAutoLoadKeyRef.current === urlCalculationKey) {
      return;
    }

    lastAutoLoadKeyRef.current = urlCalculationKey;
    const requestId = ++activeCalculationRequestIdRef.current;

    void (async () => {
      try {
        const result = await calculateAsync({
          sireRegistrationNo: urlState.sireRegistrationNo,
          damRegistrationNo: urlState.damRegistrationNo,
          generationDepth: urlState.generationDepth,
        });

        if (activeCalculationRequestIdRef.current !== requestId) {
          return;
        }

        setSelectedSire(result.sire);
        setSelectedDam(result.dam);
        setGenerationDepth(String(result.generationDepth));
        setCalculationResult(result);
        setCalculationMessage(null);
        setSelectionMessage(null);
        router.replace(
          toPublicVirtualPairingQueryHref(pathname, {
            sireRegistrationNo: result.sire.registrationNo,
            damRegistrationNo: result.dam.registrationNo,
            generationDepth: result.generationDepth,
          }),
        );
      } catch (error) {
        if (activeCalculationRequestIdRef.current !== requestId) {
          return;
        }

        setCalculationResult(null);
        setCalculationMessage(
          error instanceof Error
            ? error.message
            : t("beagle.virtualPairing.calculate.error"),
        );
      }
    })();
  }, [
    calculateAsync,
    pathname,
    router,
    queueUrlBackedCalculationStateReset,
    t,
    urlCalculationKey,
    urlState.damRegistrationNo,
    urlState.generationDepth,
    urlState.sireRegistrationNo,
  ]);

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchText.trim();
    setSelectionMessage(null);
    setCalculationMessage(null);
    setSubmittedSearch({
      field: searchField,
      query: trimmed,
      page: 1,
      pageSize: 10,
    });
  };

  const assignParent = (
    candidate: VirtualPairingDogOption,
    target: "sire" | "dam",
  ) => {
    if (target === "sire" && !isValidSire(candidate)) {
      setSelectionMessage(t("beagle.virtualPairing.validation.invalidSireSex"));
      return;
    }
    if (target === "dam" && !isValidDam(candidate)) {
      setSelectionMessage(t("beagle.virtualPairing.validation.invalidDamSex"));
      return;
    }

    setSelectionMessage(null);
    setCalculationMessage(null);
    setCalculationResult(null);
    activeCalculationRequestIdRef.current += 1;
    lastAutoLoadKeyRef.current = null;
    clearUrlState();
    if (target === "sire") {
      setSelectedSire(candidate);
      return;
    }
    setSelectedDam(candidate);
  };

  const handleCalculate = async () => {
    if (!selectedSire || !selectedDam) {
      setSelectionMessage(t("beagle.virtualPairing.validation.missingPair"));
      return;
    }

    const calculationKeyId = ++activeCalculationRequestIdRef.current;
    lastAutoLoadKeyRef.current = null;
    setSelectionMessage(null);
    setCalculationMessage(null);
    setCalculationResult(null);

    try {
      const result = await calculateAsync({
        sireRegistrationNo: selectedSire.registrationNo,
        damRegistrationNo: selectedDam.registrationNo,
        generationDepth: Number.parseInt(generationDepth, 10),
      });
      if (activeCalculationRequestIdRef.current !== calculationKeyId) {
        return;
      }

      lastAutoLoadKeyRef.current = `${result.sire.registrationNo}|${result.dam.registrationNo}|${result.generationDepth}`;
      setSelectedSire(result.sire);
      setSelectedDam(result.dam);
      setGenerationDepth(String(result.generationDepth));
      setCalculationResult(result);
      router.replace(
        toPublicVirtualPairingQueryHref(pathname, {
          sireRegistrationNo: result.sire.registrationNo,
          damRegistrationNo: result.dam.registrationNo,
          generationDepth: result.generationDepth,
        }),
      );
    } catch (error) {
      if (activeCalculationRequestIdRef.current !== calculationKeyId) {
        return;
      }

      setCalculationMessage(
        error instanceof Error
          ? error.message
          : t("beagle.virtualPairing.calculate.error"),
      );
    }
  };

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
          isPending={searchQuery.isFetching && !searchQuery.data}
          canSubmit={Boolean(searchText.trim())}
          results={searchResult}
          hasCommittedSearch={searchEnabled}
          isLoading={searchQuery.isLoading && !searchQuery.data}
          isError={searchQuery.isError && !searchQuery.data}
          errorMessage={
            searchQuery.error instanceof Error
              ? searchQuery.error.message
              : null
          }
          onFieldChange={setSearchField}
          onQueryChange={setSearchText}
          onSubmit={handleSearchSubmit}
          onSelectSire={(candidate) => assignParent(candidate, "sire")}
          onSelectDam={(candidate) => assignParent(candidate, "dam")}
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
          onClearSire={() => {
            activeCalculationRequestIdRef.current += 1;
            lastAutoLoadKeyRef.current = null;
            setSelectedSire(null);
            setCalculationResult(null);
            setSelectionMessage(null);
            setCalculationMessage(null);
            clearUrlState();
          }}
          onClearDam={() => {
            activeCalculationRequestIdRef.current += 1;
            lastAutoLoadKeyRef.current = null;
            setSelectedDam(null);
            setCalculationResult(null);
            setSelectionMessage(null);
            setCalculationMessage(null);
            clearUrlState();
          }}
          onGenerationDepthChange={(value) => {
            setGenerationDepth(value);
            setCalculationResult(null);
            setCalculationMessage(null);
            lastAutoLoadKeyRef.current = null;
            clearUrlState();
          }}
          onCalculate={() => {
            void handleCalculate();
          }}
        />

        <VirtualPairingResultPanel
          t={t}
          result={calculationResult}
          showPositions={showPositions}
          onShowPositionsChange={setShowPositions}
        />
      </div>
    </div>
  );
}
