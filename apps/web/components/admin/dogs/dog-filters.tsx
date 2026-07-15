"use client";

import type { DogStatus } from "@beagle/contracts";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  AdvancedFilterPanel,
  LabeledSelect,
} from "@/components/ui/form-fields";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/i18n";
import type { AdminDogSex } from "./types";

type DogFiltersProps = {
  query: string;
  sex: "all" | AdminDogSex;
  status: "all" | DogStatus;
  isPending: boolean;
  onQueryChange: (value: string) => void;
  onSexChange: (value: "all" | AdminDogSex) => void;
  onStatusChange: (value: "all" | DogStatus) => void;
  onSubmit: () => void;
  onReset: () => void;
};

export function DogFilters({
  query,
  sex,
  status,
  isPending,
  onQueryChange,
  onSexChange,
  onStatusChange,
  onSubmit,
  onReset,
}: DogFiltersProps) {
  const { t } = useI18n();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function handleReset() {
    setAdvancedOpen(false);
    onReset();
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("admin.dogs.filters.searchPlaceholder")}
          aria-label={t("admin.dogs.filters.searchAria")}
          className="min-w-0 flex-1"
        />
        <Button type="submit" className="sm:shrink-0" disabled={isPending}>
          {t("admin.dogs.filters.submit")}
        </Button>
      </div>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={t("admin.dogs.filters.sexAria")}
      >
        <Button
          type="button"
          size="sm"
          variant={sex === "all" ? "default" : "outline"}
          onClick={() => onSexChange("all")}
        >
          {t("admin.dogs.filters.sex.all")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={sex === "MALE" ? "default" : "outline"}
          onClick={() => onSexChange("MALE")}
        >
          {t("admin.dogs.sex.male")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={sex === "FEMALE" ? "default" : "outline"}
          onClick={() => onSexChange("FEMALE")}
        >
          {t("admin.dogs.sex.female")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={sex === "UNKNOWN" ? "default" : "outline"}
          onClick={() => onSexChange("UNKNOWN")}
        >
          {t("admin.dogs.sex.unknown")}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={handleReset}
        >
          {t("admin.dogs.filters.reset")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          aria-expanded={advancedOpen}
          onClick={() => setAdvancedOpen((current) => !current)}
        >
          {advancedOpen
            ? t("admin.dogs.filters.advanced.close")
            : t("admin.dogs.filters.advanced.open")}
        </Button>
      </div>
      {advancedOpen ? (
        <AdvancedFilterPanel title={t("admin.dogs.filters.advanced.title")}>
          <LabeledSelect
            label={t("admin.dogs.filters.statusLabel")}
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as "all" | DogStatus)
            }
          >
            <option value="all">{t("admin.dogs.filters.status.all")}</option>
            <option value="NORMAL">{t("admin.dogs.status.normal")}</option>
            <option value="REFERENCE_ONLY">
              {t("admin.dogs.status.referenceOnly")}
            </option>
          </LabeledSelect>
        </AdvancedFilterPanel>
      ) : null}
    </form>
  );
}
