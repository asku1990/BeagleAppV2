import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import type { MessageKey } from "@/lib/i18n/messages";
import type { AdminDogFormValues } from "../types";

type DogFormMetadataSectionProps = {
  values: AdminDogFormValues;
  colorOptions: ComboboxOption[];
  onValuesChange: (values: AdminDogFormValues) => void;
  t: (key: MessageKey) => string;
};

export function DogFormMetadataSection({
  values,
  colorOptions,
  onValuesChange,
  t,
}: DogFormMetadataSectionProps) {
  return (
    <>
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
