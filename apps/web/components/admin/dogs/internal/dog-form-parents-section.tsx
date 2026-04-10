import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import type { MessageKey } from "@/lib/i18n/messages";
import type { AdminDogFormValues } from "../types";
import type { DogParentOption } from "./dog-form-types";

type DogFormParentsSectionProps = {
  values: AdminDogFormValues;
  parentOptions: DogParentOption[];
  parentComboboxOptions: ComboboxOption[];
  onParentSearchChange: (value: string) => void;
  onValuesChange: (values: AdminDogFormValues) => void;
  t: (key: MessageKey) => string;
};

export function DogFormParentsSection({
  values,
  parentOptions,
  parentComboboxOptions,
  onParentSearchChange,
  onValuesChange,
  t,
}: DogFormParentsSectionProps) {
  return (
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
  );
}
