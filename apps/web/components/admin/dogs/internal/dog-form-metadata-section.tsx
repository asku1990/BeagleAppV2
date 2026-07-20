import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import type { MessageKey } from "@/lib/i18n/messages";
import type { AdminDogFormValues } from "../types";

type DogFormMetadataSectionProps = {
  values: AdminDogFormValues;
  todayDateInputValue: string;
  isSubmitting: boolean;
  colorOptions: ComboboxOption[];
  onValuesChange: (values: AdminDogFormValues) => void;
  t: (key: MessageKey) => string;
};

export function DogFormMetadataSection({
  values,
  todayDateInputValue,
  isSubmitting,
  colorOptions,
  onValuesChange,
  t,
}: DogFormMetadataSectionProps) {
  const hasEkNo = values.ekNo.trim().length > 0;
  const hasEkAssignmentWithoutNumber =
    !hasEkNo && values.ekNoAssignedOn.trim().length > 0;

  return (
    <>
      <div className="grid gap-2 md:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {t("admin.dogs.form.ekNoLabel")}
          </p>
          <Input
            value={values.ekNo}
            onChange={(event) =>
              onValuesChange({
                ...values,
                ekNo: event.target.value.replace(/\D+/gu, ""),
              })
            }
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={t("admin.dogs.form.ekNoPlaceholder")}
            maxLength={10}
          />
          {hasEkAssignmentWithoutNumber ? (
            <p className="text-xs text-destructive">
              {t("admin.dogs.form.ekNoRequiredForAssignmentDate")}
            </p>
          ) : null}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {t("admin.dogs.form.ekNoAssignedOnLabel")}
          </p>
          {values.ekNoAssignedOn.trim().length > 0 ? (
            <div className="space-y-2">
              <Input
                type="date"
                value={values.ekNoAssignedOn}
                onChange={(event) =>
                  onValuesChange({
                    ...values,
                    ekNoAssignedOn: event.target.value,
                  })
                }
                aria-label={t("admin.dogs.form.ekNoAssignedOnLabel")}
                max={todayDateInputValue}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onValuesChange({ ...values, ekNoAssignedOn: "" })
                  }
                  disabled={isSubmitting}
                >
                  {t("admin.dogs.form.ekNoAssignedOnClear")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {t("admin.dogs.form.ekNoAssignedOnUnknown")}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onValuesChange({
                    ...values,
                    ekNoAssignedOn: todayDateInputValue,
                  })
                }
                disabled={isSubmitting || !hasEkNo}
              >
                {t("admin.dogs.form.ekNoAssignedOnSet")}
              </Button>
            </div>
          )}
        </div>
      </div>
      <Combobox
        value={values.colorCode}
        options={colorOptions}
        onChange={(value) => onValuesChange({ ...values, colorCode: value })}
        placeholder={t("admin.dogs.form.colorSelectLabel")}
        searchPlaceholder={t("admin.dogs.form.searchPlaceholder")}
        emptyLabel={t("admin.dogs.form.noOptions")}
        clearLabel={t("admin.dogs.form.selectNone")}
      />
      <Input
        value={values.note}
        onChange={(event) =>
          onValuesChange({ ...values, note: event.target.value })
        }
        placeholder={t("admin.dogs.form.notePlaceholder")}
        maxLength={500}
      />
    </>
  );
}
