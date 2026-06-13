"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { CalculatePublicVirtualPairingResponse } from "@beagle/contracts";
import { useI18n } from "@/hooks/i18n";
import {
  PUBLIC_VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH,
  readPublicVirtualPairingUrlState,
} from "@/lib/public/beagle/dogs/virtual-pairing";

type CalculateAsync = (input: {
  sireRegistrationNo: string;
  damRegistrationNo: string;
  generationDepth: number;
}) => Promise<CalculatePublicVirtualPairingResponse>;

type Props = {
  calculateAsync: CalculateAsync;
  beginCalculationRequest: () => number;
  isCurrentCalculationRequest: (requestId: number) => boolean;
  invalidatePendingCalculationRequests: () => void;
  onUrlCalculationResolved: (
    result: CalculatePublicVirtualPairingResponse,
  ) => void;
  onUrlCalculationReset: (generationDepthValue: string) => void;
  onUrlCalculationError: (message: string) => void;
};

function buildUrlCalculationKey(
  sireRegistrationNo: string,
  damRegistrationNo: string,
  generationDepth: number,
): string | null {
  if (!sireRegistrationNo || !damRegistrationNo) {
    return null;
  }

  return `${sireRegistrationNo}|${damRegistrationNo}|${generationDepth}`;
}

// Public virtual pairing URL calculation synchronizer.
// Owns URL parsing and auto-load effects so the main calculation hook can stay focused on state.
export function useBeagleVirtualPairingCalculationUrlSync({
  calculateAsync,
  beginCalculationRequest,
  isCurrentCalculationRequest,
  invalidatePendingCalculationRequests,
  onUrlCalculationResolved,
  onUrlCalculationReset,
  onUrlCalculationError,
}: Props) {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const lastAutoLoadKeyRef = useRef<string | null>(null);
  const pendingUrlResetTokenRef = useRef(0);

  const urlState = useMemo(
    () => readPublicVirtualPairingUrlState(searchParams),
    [searchParams],
  );
  const urlCalculationKey = useMemo(
    () =>
      buildUrlCalculationKey(
        urlState.sireRegistrationNo,
        urlState.damRegistrationNo,
        urlState.generationDepth,
      ),
    [
      urlState.damRegistrationNo,
      urlState.generationDepth,
      urlState.sireRegistrationNo,
    ],
  );

  const rememberAutoLoadKey = useCallback((value: string) => {
    lastAutoLoadKeyRef.current = value;
  }, []);

  const forgetAutoLoadKey = useCallback(() => {
    lastAutoLoadKeyRef.current = null;
  }, []);

  const queueUrlBackedCalculationStateReset = useCallback(
    (generationDepthValue: string) => {
      const token = ++pendingUrlResetTokenRef.current;
      void Promise.resolve().then(() => {
        if (pendingUrlResetTokenRef.current !== token) {
          return;
        }

        onUrlCalculationReset(generationDepthValue);
      });
    },
    [onUrlCalculationReset],
  );

  useEffect(() => {
    if (!urlCalculationKey) {
      if (lastAutoLoadKeyRef.current != null) {
        forgetAutoLoadKey();
        invalidatePendingCalculationRequests();
        queueUrlBackedCalculationStateReset(
          String(PUBLIC_VIRTUAL_PAIRING_DEFAULT_GENERATION_DEPTH),
        );
      }
      return;
    }

    if (lastAutoLoadKeyRef.current === urlCalculationKey) {
      return;
    }

    rememberAutoLoadKey(urlCalculationKey);
    const requestId = beginCalculationRequest();

    void (async () => {
      try {
        const result = await calculateAsync({
          sireRegistrationNo: urlState.sireRegistrationNo,
          damRegistrationNo: urlState.damRegistrationNo,
          generationDepth: urlState.generationDepth,
        });

        if (!isCurrentCalculationRequest(requestId)) {
          return;
        }

        rememberAutoLoadKey(
          `${result.sire.registrationNo}|${result.dam.registrationNo}|${result.generationDepth}`,
        );
        onUrlCalculationResolved(result);
      } catch (error) {
        if (!isCurrentCalculationRequest(requestId)) {
          return;
        }

        onUrlCalculationError(
          error instanceof Error
            ? error.message
            : t("beagle.virtualPairing.calculate.error"),
        );
      }
    })();
  }, [
    beginCalculationRequest,
    calculateAsync,
    forgetAutoLoadKey,
    invalidatePendingCalculationRequests,
    isCurrentCalculationRequest,
    onUrlCalculationError,
    onUrlCalculationResolved,
    queueUrlBackedCalculationStateReset,
    rememberAutoLoadKey,
    t,
    urlCalculationKey,
    urlState.damRegistrationNo,
    urlState.generationDepth,
    urlState.sireRegistrationNo,
  ]);

  return {
    urlState,
    rememberAutoLoadKey,
    forgetAutoLoadKey,
  };
}
