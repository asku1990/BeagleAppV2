"use client";

import { useCallback, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SearchParamsLike = {
  get: (key: string) => string | null;
};

type UseAdminDogDiseasesUiStateInput = {
  initialDiseaseCode?: string | null;
};

type AdminDogDiseasesRouteState = {
  diseaseCode: string | null;
  page: number;
};

const DEFAULT_DISEASE_CODE = "epi";

function readPage(value: string | null): number {
  if (!value) {
    return 1;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function readDiseaseCode(value: string | null): string | null | undefined {
  if (value === null) {
    return undefined;
  }

  if (value === "all") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizePage(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

function toQueryString(state: AdminDogDiseasesRouteState): string {
  const params = new URLSearchParams();

  if (state.diseaseCode === null) {
    params.set("diseaseCode", "all");
  } else if (typeof state.diseaseCode === "string") {
    params.set("diseaseCode", state.diseaseCode);
  }

  if (state.page > 1) {
    params.set("page", String(state.page));
  }

  return params.toString();
}

export function readAdminDogDiseasesUrlState(params: SearchParamsLike): {
  diseaseCode: string | null | undefined;
  page: number;
} {
  return {
    diseaseCode: readDiseaseCode(params.get("diseaseCode")),
    page: readPage(params.get("page")),
  };
}

export function useAdminDogDiseasesUiState({
  initialDiseaseCode = DEFAULT_DISEASE_CODE,
}: UseAdminDogDiseasesUiStateInput = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlState = useMemo(
    () => readAdminDogDiseasesUrlState(searchParams),
    [searchParams],
  );

  const diseaseCode =
    urlState.diseaseCode === undefined
      ? initialDiseaseCode
      : urlState.diseaseCode;

  const commitState = useCallback(
    (nextState: AdminDogDiseasesRouteState) => {
      const query = toQueryString(nextState);
      const href = query ? `${pathname}?${query}` : pathname;

      startTransition(() => {
        router.push(href, { scroll: false });
      });
    },
    [pathname, router],
  );

  const setDiseaseCode = useCallback(
    (nextDiseaseCode: string | null) => {
      commitState({
        diseaseCode: nextDiseaseCode,
        page: 1,
      });
    },
    [commitState],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      commitState({
        diseaseCode,
        page: normalizePage(nextPage),
      });
    },
    [commitState, diseaseCode],
  );

  return {
    diseaseCode,
    page: urlState.page,
    isPending,
    setDiseaseCode,
    setPage,
  };
}
