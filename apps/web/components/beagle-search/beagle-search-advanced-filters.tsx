import { beagleTheme } from "@/components/ui/beagle-theme";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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
    <section
      className={cn("mt-4 rounded-lg border p-3", beagleTheme.border)}
      aria-label={t("search.form.advanced.title")}
    >
      <p className={cn("text-sm font-medium", beagleTheme.inkStrongText)}>
        {t("search.form.advanced.title")}
      </p>
      <label className="mt-3 flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={multipleRegsOnly}
          onChange={(event) => onMultipleRegsOnlyChange(event.target.checked)}
          className={cn("size-4 rounded border", beagleTheme.border)}
        />
        <span className={beagleTheme.inkStrongText}>
          {t("search.advanced.multipleRegsOnly")}
        </span>
      </label>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-xs">
          <span className={beagleTheme.mutedText}>
            {t("search.advanced.sex")}
          </span>
          <select
            value={sex}
            onChange={(event) =>
              onSexChange(event.target.value as "any" | "male" | "female")
            }
            className={cn(
              "h-9 w-full rounded-md border bg-white px-3 text-sm",
              beagleTheme.border,
            )}
          >
            <option value="any">{t("search.advanced.option.any")}</option>
            <option value="male">{t("search.advanced.sex.male")}</option>
            <option value="female">{t("search.advanced.sex.female")}</option>
          </select>
        </label>
        <label className="space-y-1 text-xs">
          <span className={beagleTheme.mutedText}>
            {t("search.advanced.birthYearFrom")}
          </span>
          <Input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={birthYearFrom}
            onChange={(event) => onBirthYearFromChange(event.target.value)}
            placeholder="2000"
          />
        </label>
        <label className="space-y-1 text-xs">
          <span className={beagleTheme.mutedText}>
            {t("search.advanced.birthYearTo")}
          </span>
          <Input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={birthYearTo}
            onChange={(event) => onBirthYearToChange(event.target.value)}
            placeholder="2026"
          />
        </label>
        <div className="space-y-1 text-xs">
          <span className={beagleTheme.mutedText}>
            {t("search.advanced.ekOnly")}
          </span>
          <label className="flex h-9 items-center gap-2 rounded-md border px-3 text-sm">
            <input
              type="checkbox"
              checked={ekOnly}
              onChange={(event) => onEkOnlyChange(event.target.checked)}
              className={cn("size-4 rounded border", beagleTheme.border)}
            />
            <span className={beagleTheme.inkStrongText}>
              {t("search.advanced.ekOnly")}
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}
