import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import type { MessageKey } from "@/lib/i18n/messages";
import type { AdminDogFormValues } from "../types";
import type { DogParentOption } from "./dog-form-types";

type DogFormParentsSectionProps = {
  values: AdminDogFormValues;
  parentOptions: DogParentOption[];
  parentComboboxOptions: ComboboxOption[];
  onParentSearchChange: (value: string) => void;
  onValuesChange: (values: AdminDogFormValues) => void;
  onCalculateInbreeding?: () => void | Promise<void>;
  isCalculatingInbreeding: boolean;
  t: (key: MessageKey) => string;
};

function formatPercent(value: number | null): string {
  if (value == null) {
    return "-";
  }

  return `${value.toFixed(7).replace(/\.?0+$/, "")} %`;
}

export function DogFormParentsSection({
  values,
  parentOptions,
  parentComboboxOptions,
  onParentSearchChange,
  onValuesChange,
  onCalculateInbreeding,
  isCalculatingInbreeding,
  t,
}: DogFormParentsSectionProps) {
  const canCalculateInbreeding =
    values.sirePreviewRegistrationNo.trim().length > 0 &&
    values.damPreviewRegistrationNo.trim().length > 0 &&
    !isCalculatingInbreeding;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {t("admin.dogs.form.sireSelectLabel")}
          </p>
          <Combobox
            value={values.sirePreviewRegistrationNo}
            options={parentComboboxOptions}
            onSearchChange={onParentSearchChange}
            onChange={(registrationNo) => {
              const selected = parentOptions.find(
                (option) => option.registrationNo === registrationNo,
              );

              onValuesChange({
                ...values,
                sirePreviewName: selected?.name ?? "",
                sirePreviewRegistrationNo: selected?.registrationNo ?? "",
              });
            }}
            placeholder={t("admin.dogs.form.sireSelectLabel")}
            searchPlaceholder={t("admin.dogs.form.searchPlaceholder")}
            clearLabel={t("admin.dogs.form.selectNone")}
            emptyLabel={t("admin.dogs.form.noOptions")}
          />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {t("admin.dogs.form.damSelectLabel")}
          </p>
          <Combobox
            value={values.damPreviewRegistrationNo}
            options={parentComboboxOptions}
            onSearchChange={onParentSearchChange}
            onChange={(registrationNo) => {
              const selected = parentOptions.find(
                (option) => option.registrationNo === registrationNo,
              );

              onValuesChange({
                ...values,
                damPreviewName: selected?.name ?? "",
                damPreviewRegistrationNo: selected?.registrationNo ?? "",
              });
            }}
            placeholder={t("admin.dogs.form.damSelectLabel")}
            searchPlaceholder={t("admin.dogs.form.searchPlaceholder")}
            clearLabel={t("admin.dogs.form.selectNone")}
            emptyLabel={t("admin.dogs.form.noOptions")}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-md border border-dashed p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">
            {t("admin.dogs.form.inbreedingLabel")}
          </p>
          <p className="text-sm text-muted-foreground">
            {values.inbreedingCoefficientPct != null
              ? formatPercent(values.inbreedingCoefficientPct)
              : t("admin.dogs.form.inbreedingEmpty")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void onCalculateInbreeding?.()}
          disabled={!canCalculateInbreeding || !onCalculateInbreeding}
        >
          <Calculator className="size-4" aria-hidden="true" />
          {isCalculatingInbreeding
            ? t("admin.dogs.form.inbreedingCalculating")
            : t("admin.dogs.form.inbreedingCalculate")}
        </Button>
      </div>
    </div>
  );
}
