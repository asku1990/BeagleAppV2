import type { FormEvent } from "react";
import type {
  VirtualPairingDogOption,
  VirtualPairingSearchField,
  VirtualPairingSearchResponse,
} from "@beagle/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TranslateFn } from "../admin-virtual-pairing-page-client";

type SearchQueryState = {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  data?: {
    total: number;
    items: VirtualPairingDogOption[];
    isLimited?: boolean;
    candidateLimit?: VirtualPairingSearchResponse["candidateLimit"];
  };
};

type Props = {
  t: TranslateFn;
  searchField: VirtualPairingSearchField;
  searchText: string;
  searchEnabled: boolean;
  searchQuery: SearchQueryState;
  onSearchFieldChange: (field: VirtualPairingSearchField) => void;
  onSearchTextChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSelectParent: (
    candidate: VirtualPairingDogOption,
    target: "sire" | "dam",
  ) => void;
};

function formatSexLabel(sex: VirtualPairingDogOption["sex"], t: TranslateFn) {
  if (sex === "U") return t("admin.dogs.sex.male");
  if (sex === "N") return t("admin.dogs.sex.female");
  return t("admin.dogs.sex.unknown");
}

const SEARCH_FIELDS: VirtualPairingSearchField[] = ["name", "reg", "ek"];

function canSelectAsSire(candidate: VirtualPairingDogOption): boolean {
  return candidate.sex === "U";
}

function canSelectAsDam(candidate: VirtualPairingDogOption): boolean {
  return candidate.sex === "N";
}

// Search card for the admin virtual-pairing workflow.
export function AdminVirtualPairingSearchPanel({
  t,
  searchField,
  searchText,
  searchEnabled,
  searchQuery,
  onSearchFieldChange,
  onSearchTextChange,
  onSubmit,
  onSelectParent,
}: Props) {
  const results = searchQuery.data?.items ?? [];

  return (
    <div className="space-y-4">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <div className="text-sm font-medium">
            {t("admin.virtualPairing.search.fieldLabel")}
          </div>
          <div className="flex flex-wrap gap-2">
            {SEARCH_FIELDS.map((field) => (
              <Button
                key={field}
                type="button"
                size="sm"
                variant={searchField === field ? "default" : "outline"}
                onClick={() => onSearchFieldChange(field)}
              >
                {t(`admin.virtualPairing.search.field.${field}`)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            value={searchText}
            onChange={(event) => onSearchTextChange(event.target.value)}
            placeholder={t("admin.virtualPairing.search.inputPlaceholder")}
            aria-label={t("admin.virtualPairing.search.inputAria")}
          />
          <Button type="submit">
            {t("admin.virtualPairing.search.button")}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("admin.virtualPairing.search.helper")}
        </p>
      </form>

      {searchQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">
          {t("admin.virtualPairing.search.loading")}
        </p>
      ) : null}
      {searchQuery.isError ? (
        <p className="text-sm text-destructive">
          {searchQuery.error instanceof Error
            ? searchQuery.error.message
            : t("admin.virtualPairing.search.error")}
        </p>
      ) : null}
      {searchQuery.data ? (
        <p className="text-sm text-muted-foreground">
          {t("admin.virtualPairing.search.countPrefix")}{" "}
          {searchQuery.data.total}
        </p>
      ) : null}

      {searchQuery.data?.isLimited &&
      searchQuery.data.candidateLimit != null ? (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800">
          <span>{t("admin.virtualPairing.search.limitedWarningPrefix")} </span>
          <span>{searchQuery.data.candidateLimit}</span>
          <span> {t("admin.virtualPairing.search.limitedWarningSuffix")}</span>
        </div>
      ) : null}

      {searchEnabled && results.length === 0 && !searchQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">
          {t("admin.virtualPairing.search.empty")}
        </p>
      ) : null}

      {results.length > 0 ? (
        <div className="space-y-3">
          {results.map((candidate) => (
            <div
              key={candidate.id}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <div className="font-medium">{candidate.name}</div>
                <div className="text-sm text-muted-foreground">
                  {candidate.registrationNo}
                  {candidate.ekNo != null
                    ? ` · EK ${candidate.ekNo}`
                    : ""} · {formatSexLabel(candidate.sex, t)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {canSelectAsSire(candidate) ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectParent(candidate, "sire")}
                  >
                    {t("admin.virtualPairing.search.selectSire")}
                  </Button>
                ) : null}
                {canSelectAsDam(candidate) ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectParent(candidate, "dam")}
                  >
                    {t("admin.virtualPairing.search.selectDam")}
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
