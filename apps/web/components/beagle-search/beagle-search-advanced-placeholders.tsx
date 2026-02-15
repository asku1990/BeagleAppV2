import { beagleTheme } from "@/components/ui/beagle-theme";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BeagleSearchAdvancedPlaceholders() {
  const { t } = useI18n();

  return (
    <section
      className={cn("mt-4 rounded-lg border p-3", beagleTheme.border)}
      aria-label={t("search.form.advanced.title")}
    >
      <p className={cn("text-sm font-medium", beagleTheme.inkStrongText)}>
        {t("search.form.advanced.title")}
      </p>
      <p className={cn("mt-1 text-xs", beagleTheme.mutedText)}>
        {t("search.form.advanced.placeholder")}
      </p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-xs">
          <span className={beagleTheme.mutedText}>
            {t("search.advanced.sex")}
          </span>
          <select
            disabled
            className={cn(
              "h-9 w-full rounded-md border bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-70",
              beagleTheme.border,
            )}
          >
            <option>{t("search.advanced.option.any")}</option>
          </select>
        </label>
        <label className="space-y-1 text-xs">
          <span className={beagleTheme.mutedText}>
            {t("search.advanced.birthYearFrom")}
          </span>
          <Input disabled placeholder="2000" />
        </label>
        <label className="space-y-1 text-xs">
          <span className={beagleTheme.mutedText}>
            {t("search.advanced.birthYearTo")}
          </span>
          <Input disabled placeholder="2026" />
        </label>
        <label className="space-y-1 text-xs">
          <span className={beagleTheme.mutedText}>
            {t("search.advanced.ekOnly")}
          </span>
          <select
            disabled
            className={cn(
              "h-9 w-full rounded-md border bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-70",
              beagleTheme.border,
            )}
          >
            <option>{t("search.advanced.option.any")}</option>
          </select>
        </label>
      </div>
    </section>
  );
}
