"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  CalculateAdminVirtualPairingResponse,
  VirtualPairingDogOption,
  VirtualPairingSearchField,
  VirtualPairingSearchRequest,
} from "@beagle/contracts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/hooks/i18n";
import {
  readVirtualPairingUrlState,
  toVirtualPairingQueryHref,
} from "@/lib/admin/dogs/virtual-pairing";
import {
  useAdminVirtualPairingSearchQuery,
  useCalculateAdminVirtualPairingMutation,
} from "@/queries/admin/dogs";
import { AdminVirtualPairingResultPanel } from "./internal/virtual-pairing-result-panel";
import { AdminVirtualPairingSearchPanel } from "./internal/virtual-pairing-search-panel";
import { AdminVirtualPairingSelectionPanel } from "./internal/virtual-pairing-selection-panel";

export type TranslateFn = ReturnType<typeof useI18n>["t"];

function isValidSire(candidate: VirtualPairingDogOption): boolean {
  return candidate.sex === "U";
}

function isValidDam(candidate: VirtualPairingDogOption): boolean {
  return candidate.sex === "N";
}

// Admin-only virtual pairing workflow with legacy search, selection, and placeholders.
export function AdminVirtualPairingPageClient() {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lastAutoLoadKeyRef = useRef<string | null>(null);
  const activeCalculationKeyRef = useRef<string | null>(null);
  const [searchField, setSearchField] =
    useState<VirtualPairingSearchField>("reg");
  const [searchText, setSearchText] = useState("");
  const [submittedSearch, setSubmittedSearch] =
    useState<VirtualPairingSearchRequest | null>(null);
  const [selectedSire, setSelectedSire] =
    useState<VirtualPairingDogOption | null>(null);
  const [selectedDam, setSelectedDam] =
    useState<VirtualPairingDogOption | null>(null);
  const [generationDepth, setGenerationDepth] = useState("9");
  const [selectionMessage, setSelectionMessage] = useState<string | null>(null);
  const [calculationResult, setCalculationResult] =
    useState<CalculateAdminVirtualPairingResponse | null>(null);
  const [calculationMessage, setCalculationMessage] = useState<string | null>(
    null,
  );

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
  const searchQuery = useAdminVirtualPairingSearchQuery(
    searchFilters,
    searchEnabled,
  );
  const calculateMutation = useCalculateAdminVirtualPairingMutation();
  const urlState = useMemo(
    () => readVirtualPairingUrlState(searchParams),
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
  const canCalculate =
    Boolean(selectedSire && selectedDam) && !calculateMutation.isPending;

  useEffect(() => {
    if (!urlCalculationKey) {
      return;
    }

    if (lastAutoLoadKeyRef.current === urlCalculationKey) {
      return;
    }

    lastAutoLoadKeyRef.current = urlCalculationKey;
    activeCalculationKeyRef.current = urlCalculationKey;
    // Clear stale messages before loading the URL-backed calculation result.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectionMessage(null);
    setCalculationMessage(null);

    void (async () => {
      try {
        const result = await calculateMutation.mutateAsync({
          sireRegistrationNo: urlState.sireRegistrationNo,
          damRegistrationNo: urlState.damRegistrationNo,
          generationDepth: urlState.generationDepth,
        });

        if (activeCalculationKeyRef.current !== urlCalculationKey) {
          return;
        }

        setSelectedSire(result.sire);
        setSelectedDam(result.dam);
        setGenerationDepth(String(result.generationDepth));
        setCalculationResult(result);
      } catch (error) {
        if (activeCalculationKeyRef.current !== urlCalculationKey) {
          return;
        }

        setCalculationResult(null);
        setCalculationMessage(
          error instanceof Error
            ? error.message
            : t("admin.virtualPairing.calculate.error"),
        );
      }
    })();
  }, [
    calculateMutation,
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
      setSelectionMessage(t("admin.virtualPairing.validation.invalidSireSex"));
      return;
    }
    if (target === "dam" && !isValidDam(candidate)) {
      setSelectionMessage(t("admin.virtualPairing.validation.invalidDamSex"));
      return;
    }

    setSelectionMessage(null);
    setCalculationMessage(null);
    setCalculationResult(null);
    activeCalculationKeyRef.current = null;
    if (target === "sire") {
      setSelectedSire(candidate);
      return;
    }
    setSelectedDam(candidate);
  };

  const handleCalculate = async () => {
    if (!selectedSire || !selectedDam) {
      return;
    }

    const calculationKey = `${selectedSire.registrationNo}|${selectedDam.registrationNo}|${generationDepth}`;
    activeCalculationKeyRef.current = calculationKey;
    setSelectionMessage(null);
    setCalculationMessage(null);

    try {
      const result = await calculateMutation.mutateAsync({
        sireRegistrationNo: selectedSire.registrationNo,
        damRegistrationNo: selectedDam.registrationNo,
        generationDepth: Number.parseInt(generationDepth, 10),
      });
      if (activeCalculationKeyRef.current !== calculationKey) {
        return;
      }
      lastAutoLoadKeyRef.current = `${result.sire.registrationNo}|${result.dam.registrationNo}|${result.generationDepth}`;
      setSelectedSire(result.sire);
      setSelectedDam(result.dam);
      setGenerationDepth(String(result.generationDepth));
      setCalculationResult(result);
      router.replace(
        toVirtualPairingQueryHref(pathname, {
          sireRegistrationNo: result.sire.registrationNo,
          damRegistrationNo: result.dam.registrationNo,
          generationDepth: result.generationDepth,
        }),
        { scroll: false },
      );
    } catch (error) {
      if (activeCalculationKeyRef.current !== calculationKey) {
        return;
      }

      setCalculationResult(null);
      setCalculationMessage(
        error instanceof Error
          ? error.message
          : t("admin.virtualPairing.calculate.error"),
      );
    }
  };

  const clearSelectedSire = () => {
    setSelectedSire(null);
    setCalculationMessage(null);
    setCalculationResult(null);
    activeCalculationKeyRef.current = null;
  };

  const clearSelectedDam = () => {
    setSelectedDam(null);
    setCalculationMessage(null);
    setCalculationResult(null);
    activeCalculationKeyRef.current = null;
  };

  const handleGenerationDepthChange = (value: string) => {
    setGenerationDepth(value);
    setCalculationMessage(null);
    setCalculationResult(null);
    activeCalculationKeyRef.current = null;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("admin.virtualPairing.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.virtualPairing.description")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.virtualPairing.search.title")}</CardTitle>
          <CardDescription>
            {t("admin.virtualPairing.search.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdminVirtualPairingSearchPanel
            t={t}
            searchField={searchField}
            searchText={searchText}
            searchEnabled={searchEnabled}
            searchQuery={searchQuery}
            onSearchFieldChange={setSearchField}
            onSearchTextChange={setSearchText}
            onSubmit={handleSearchSubmit}
            onSelectParent={assignParent}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.virtualPairing.selected.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdminVirtualPairingSelectionPanel
              t={t}
              selectedSire={selectedSire}
              selectedDam={selectedDam}
              generationDepth={generationDepth}
              isCalculating={calculateMutation.isPending}
              canCalculate={canCalculate}
              selectionMessage={selectionMessage}
              calculationMessage={calculationMessage}
              onGenerationDepthChange={handleGenerationDepthChange}
              onClearSire={clearSelectedSire}
              onClearDam={clearSelectedDam}
              onCalculate={handleCalculate}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("admin.virtualPairing.result.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdminVirtualPairingResultPanel t={t} result={calculationResult} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
