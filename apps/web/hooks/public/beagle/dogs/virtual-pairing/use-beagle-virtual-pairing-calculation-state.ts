"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type {
  CalculatePublicVirtualPairingResponse,
  VirtualPairingDogOption,
} from "@beagle/contracts";
import { useI18n } from "@/hooks/i18n";
import {
  PUBLIC_VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH,
  toPublicVirtualPairingQueryHref,
} from "@/lib/public/beagle/dogs/virtual-pairing";
import { useCalculatePublicVirtualPairingMutation } from "@/queries/public/beagle/dogs/virtual-pairing";
import { useBeagleVirtualPairingCalculationUrlSync } from "./use-beagle-virtual-pairing-calculation-url-sync";

function isValidSire(candidate: VirtualPairingDogOption): boolean {
  return candidate.sex === "U";
}

function isValidDam(candidate: VirtualPairingDogOption): boolean {
  return candidate.sex === "N";
}

// Public virtual pairing calculation state controller.
// Owns selection state, manual calculations, and URL-sync orchestration via a dedicated helper hook.
export function useBeagleVirtualPairingCalculationState() {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const activeCalculationRequestIdRef = useRef(0);
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

  const calculateMutation = useCalculatePublicVirtualPairingMutation();
  const { mutateAsync: calculateAsync, isPending: isCalculating } =
    calculateMutation;
  const canCalculate = Boolean(selectedSire && selectedDam) && !isCalculating;

  const beginCalculationRequest = useCallback(() => {
    activeCalculationRequestIdRef.current += 1;
    return activeCalculationRequestIdRef.current;
  }, []);

  const isCurrentCalculationRequest = useCallback((requestId: number) => {
    return activeCalculationRequestIdRef.current === requestId;
  }, []);

  const invalidatePendingCalculationRequests = useCallback(() => {
    activeCalculationRequestIdRef.current += 1;
  }, []);

  const clearUrlState = useCallback(() => {
    router.replace(pathname);
  }, [pathname, router]);

  const applyCalculatedResult = useCallback(
    (result: CalculatePublicVirtualPairingResponse) => {
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
    },
    [pathname, router],
  );

  const resetUrlBackedCalculationState = useCallback(
    (generationDepthValue: string) => {
      setSelectedSire(null);
      setSelectedDam(null);
      setGenerationDepth(generationDepthValue);
      setSelectionMessage(null);
      setCalculationMessage(null);
      setCalculationResult(null);
    },
    [],
  );

  const {
    rememberAutoLoadKey,
    forgetAutoLoadKey,
    suppressCurrentUrlCalculation,
  } = useBeagleVirtualPairingCalculationUrlSync({
    calculateAsync,
    beginCalculationRequest,
    isCurrentCalculationRequest,
    invalidatePendingCalculationRequests,
    onUrlCalculationResolved: applyCalculatedResult,
    onUrlCalculationReset: resetUrlBackedCalculationState,
    onUrlCalculationError: (message) => {
      setCalculationResult(null);
      setCalculationMessage(message);
    },
  });

  const assignParent = useCallback(
    (candidate: VirtualPairingDogOption, target: "sire" | "dam") => {
      if (target === "sire" && !isValidSire(candidate)) {
        setSelectionMessage(
          t("beagle.virtualPairing.validation.invalidSireSex"),
        );
        return;
      }
      if (target === "dam" && !isValidDam(candidate)) {
        setSelectionMessage(
          t("beagle.virtualPairing.validation.invalidDamSex"),
        );
        return;
      }

      setSelectionMessage(null);
      setCalculationMessage(null);
      setCalculationResult(null);
      invalidatePendingCalculationRequests();
      // Parent changes are draft edits, not permission to reuse the old URL result.
      suppressCurrentUrlCalculation();
      forgetAutoLoadKey();
      clearUrlState();
      if (target === "sire") {
        setSelectedSire(candidate);
        return;
      }
      setSelectedDam(candidate);
    },
    [
      clearUrlState,
      forgetAutoLoadKey,
      invalidatePendingCalculationRequests,
      suppressCurrentUrlCalculation,
      t,
    ],
  );

  const handleCalculate = useCallback(async () => {
    if (!selectedSire || !selectedDam) {
      setSelectionMessage(t("beagle.virtualPairing.validation.missingPair"));
      return;
    }

    const calculationKeyId = beginCalculationRequest();
    forgetAutoLoadKey();
    setSelectionMessage(null);
    setCalculationMessage(null);
    setCalculationResult(null);

    try {
      const result = await calculateAsync({
        sireRegistrationNo: selectedSire.registrationNo,
        damRegistrationNo: selectedDam.registrationNo,
        generationDepth: Number.parseInt(generationDepth, 10),
      });
      if (!isCurrentCalculationRequest(calculationKeyId)) {
        return;
      }

      rememberAutoLoadKey(
        `${result.sire.registrationNo}|${result.dam.registrationNo}|${result.generationDepth}`,
      );
      applyCalculatedResult(result);
    } catch (error) {
      if (!isCurrentCalculationRequest(calculationKeyId)) {
        return;
      }

      setCalculationMessage(
        error instanceof Error
          ? error.message
          : t("beagle.virtualPairing.calculate.error"),
      );
    }
  }, [
    applyCalculatedResult,
    beginCalculationRequest,
    calculateAsync,
    forgetAutoLoadKey,
    generationDepth,
    isCurrentCalculationRequest,
    rememberAutoLoadKey,
    selectedDam,
    selectedSire,
    t,
  ]);

  const onSelectSire = useCallback(
    (candidate: VirtualPairingDogOption) => {
      assignParent(candidate, "sire");
    },
    [assignParent],
  );

  const onSelectDam = useCallback(
    (candidate: VirtualPairingDogOption) => {
      assignParent(candidate, "dam");
    },
    [assignParent],
  );

  const onCalculate = useCallback(() => {
    void handleCalculate();
  }, [handleCalculate]);

  const onClearSire = useCallback(() => {
    invalidatePendingCalculationRequests();
    suppressCurrentUrlCalculation();
    forgetAutoLoadKey();
    setSelectedSire(null);
    setCalculationResult(null);
    setSelectionMessage(null);
    setCalculationMessage(null);
    clearUrlState();
  }, [
    clearUrlState,
    forgetAutoLoadKey,
    invalidatePendingCalculationRequests,
    suppressCurrentUrlCalculation,
  ]);

  const onClearDam = useCallback(() => {
    invalidatePendingCalculationRequests();
    suppressCurrentUrlCalculation();
    forgetAutoLoadKey();
    setSelectedDam(null);
    setCalculationResult(null);
    setSelectionMessage(null);
    setCalculationMessage(null);
    clearUrlState();
  }, [
    clearUrlState,
    forgetAutoLoadKey,
    invalidatePendingCalculationRequests,
    suppressCurrentUrlCalculation,
  ]);

  const onGenerationDepthChange = useCallback(
    (value: string) => {
      invalidatePendingCalculationRequests();
      // SP changes clear the result and wait for the next explicit calculation.
      suppressCurrentUrlCalculation();
      forgetAutoLoadKey();
      setGenerationDepth(value);
      setSelectionMessage(null);
      setCalculationResult(null);
      setCalculationMessage(null);
      clearUrlState();
    },
    [
      clearUrlState,
      forgetAutoLoadKey,
      invalidatePendingCalculationRequests,
      suppressCurrentUrlCalculation,
    ],
  );

  return {
    t,
    selectedSire,
    selectedDam,
    generationDepth,
    isCalculating,
    canCalculate,
    selectionMessage,
    calculationMessage,
    calculationResult,
    showPositions,
    onSelectSire,
    onSelectDam,
    onClearSire,
    onClearDam,
    onGenerationDepthChange,
    onCalculate,
    onShowPositionsChange: setShowPositions,
  };
}
