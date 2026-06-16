"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import type {
  VirtualPairingSearchField,
  VirtualPairingSearchRequest,
} from "@beagle/contracts";
import { usePublicVirtualPairingSearchQuery } from "@/queries/public/beagle/dogs/virtual-pairing";

const DEFAULT_SEARCH_PAGE_SIZE = 10;

function getSearchFilters(
  searchField: VirtualPairingSearchField,
  submittedSearch: VirtualPairingSearchRequest | null,
): VirtualPairingSearchRequest {
  return (
    submittedSearch ?? {
      field: searchField,
      query: "",
      page: 1,
      pageSize: DEFAULT_SEARCH_PAGE_SIZE,
    }
  );
}

// Public virtual pairing search state controller.
// Owns the search form draft, committed search request, and search query wiring.
export function useBeagleVirtualPairingSearchState() {
  const [searchField, setSearchField] =
    useState<VirtualPairingSearchField>("name");
  const [searchText, setSearchText] = useState("");
  const [submittedSearch, setSubmittedSearch] =
    useState<VirtualPairingSearchRequest | null>(null);

  const searchFilters = useMemo(
    () => getSearchFilters(searchField, submittedSearch),
    [searchField, submittedSearch],
  );
  const searchEnabled = Boolean(submittedSearch?.query.trim().length);
  const searchQuery = usePublicVirtualPairingSearchQuery(
    searchFilters,
    searchEnabled,
  );

  const handleSearchSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = searchText.trim();
      setSubmittedSearch({
        field: searchField,
        query: trimmed,
        page: 1,
        pageSize: DEFAULT_SEARCH_PAGE_SIZE,
      });
    },
    [searchField, searchText],
  );

  return {
    searchField,
    searchText,
    searchResult: searchQuery.data ?? null,
    searchEnabled,
    hasCommittedSearch: searchEnabled,
    canSubmit: Boolean(searchText.trim()),
    isSearchPending: searchQuery.isFetching && !searchQuery.data,
    isSearchLoading: searchQuery.isLoading && !searchQuery.data,
    isSearchError: searchQuery.isError && !searchQuery.data,
    searchErrorMessage:
      searchQuery.error instanceof Error ? searchQuery.error.message : null,
    onSearchFieldChange: setSearchField,
    onSearchTextChange: setSearchText,
    onSearchSubmit: handleSearchSubmit,
  };
}
