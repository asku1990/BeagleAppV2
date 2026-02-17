import {
  AdvancedFilterPanel,
  LabeledCheckbox,
  LabeledInput,
  LabeledSelect,
} from "@/components/ui/form-fields";
import { useI18n } from "@/lib/i18n";

export function BeagleSearchAdvancedFilters({
  sex,
  onSexChange,
  birthYearFrom,
  birthYearTo,
  onBirthYearFromChange,
  onBirthYearToChange,
  ekOnly,
  onEkOnlyChange,
  multipleRegsOnly,
  onMultipleRegsOnlyChange,
}: {
  sex: "any" | "male" | "female";
  onSexChange: (value: "any" | "male" | "female") => void;
  birthYearFrom: string;
  birthYearTo: string;
  onBirthYearFromChange: (value: string) => void;
  onBirthYearToChange: (value: string) => void;
  ekOnly: boolean;
  onEkOnlyChange: (value: boolean) => void;
  multipleRegsOnly: boolean;
  onMultipleRegsOnlyChange: (value: boolean) => void;
}) {
  const { t } = useI18n();

  return (
    <AdvancedFilterPanel title={t("search.form.advanced.title")}>
      <div className="grid gap-3 md:grid-cols-3">
        <LabeledSelect
          label={t("search.advanced.sex")}
          value={sex}
          onChange={(event) =>
            onSexChange(event.target.value as "any" | "male" | "female")
          }
        >
          <option value="any">{t("search.advanced.option.any")}</option>
          <option value="male">{t("search.advanced.sex.male")}</option>
          <option value="female">{t("search.advanced.sex.female")}</option>
        </LabeledSelect>

        <LabeledInput
          label={t("search.advanced.birthYearFrom")}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={birthYearFrom}
          onChange={(event) => onBirthYearFromChange(event.target.value)}
          placeholder="2000"
          className="md:col-span-1"
        />

        <LabeledInput
          label={t("search.advanced.birthYearTo")}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={birthYearTo}
          onChange={(event) => onBirthYearToChange(event.target.value)}
          placeholder="2026"
          className="md:col-span-1"
        />
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <LabeledCheckbox
          label={t("search.advanced.ekOnly")}
          checked={ekOnly}
          onChange={(event) => onEkOnlyChange(event.target.checked)}
        />

        <LabeledCheckbox
          label={t("search.advanced.multipleRegsOnly")}
          checked={multipleRegsOnly}
          onChange={(event) => onMultipleRegsOnlyChange(event.target.checked)}
        />
      </div>
    </AdvancedFilterPanel>
  );
}
