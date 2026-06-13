"use client";

import type { VirtualPairingSearchField } from "@beagle/contracts";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n/messages";

type TranslateFn = (key: MessageKey) => string;

type Props = {
  t: TranslateFn;
  field: VirtualPairingSearchField;
  query: string;
  isPending: boolean;
  canSubmit: boolean;
  onFieldChange: (field: VirtualPairingSearchField) => void;
  onQueryChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function VirtualPairingSearchForm({
  t,
  field,
  query,
  isPending,
  canSubmit,
  onFieldChange,
  onQueryChange,
  onSubmit,
}: Props) {
  return (
    <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-end">
          <label className="space-y-1">
            <span
              className={cn("text-sm font-medium", beagleTheme.inkStrongText)}
            >
              {t("beagle.virtualPairing.search.fieldLabel")}
            </span>
            <select
              value={field}
              onChange={(event) =>
                onFieldChange(event.target.value as VirtualPairingSearchField)
              }
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="ek">
                {t("beagle.virtualPairing.search.field.ek")}
              </option>
              <option value="reg">
                {t("beagle.virtualPairing.search.field.reg")}
              </option>
              <option value="name">
                {t("beagle.virtualPairing.search.field.name")}
              </option>
            </select>
          </label>
          <label className="space-y-1">
            <span
              className={cn("text-sm font-medium", beagleTheme.inkStrongText)}
            >
              {t("beagle.virtualPairing.search.inputAria")}
            </span>
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={t("beagle.virtualPairing.search.inputPlaceholder")}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </label>
          <Button type="submit" disabled={!canSubmit || isPending}>
            {isPending
              ? t("beagle.virtualPairing.search.loading")
              : t("beagle.virtualPairing.search.button")}
          </Button>
        </div>
        <p className={cn("text-sm", beagleTheme.mutedText)}>
          {t("beagle.virtualPairing.search.helper")}
        </p>
      </form>
    </CardContent>
  );
}
