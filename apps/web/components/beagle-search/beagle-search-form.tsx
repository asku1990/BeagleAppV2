import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n, type MessageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type {
  BeaglePrimarySearchMode,
  BeagleSearchQueryState,
  BeagleSearchSort,
} from "@/lib/beagle-search";
import { BeagleSearchAdvancedPlaceholders } from "./beagle-search-advanced-placeholders";

const modeKeyMap: Record<BeaglePrimarySearchMode, MessageKey> = {
  ek: "search.form.mode.ek",
  reg: "search.form.mode.reg",
  name: "search.form.mode.name",
  none: "search.form.mode.none",
  invalid: "search.form.mode.invalid",
};

export function BeagleSearchForm({
  values,
  mode,
  sort,
  advancedOpen,
  isPending,
  canSubmit,
  onFieldChange,
  onSubmit,
  onReset,
  onToggleAdvanced,
  onSortChange,
}: {
  values: Pick<BeagleSearchQueryState, "ek" | "reg" | "name">;
  mode: BeaglePrimarySearchMode;
  sort: BeagleSearchSort;
  advancedOpen: boolean;
  isPending: boolean;
  canSubmit: boolean;
  onFieldChange: (field: "ek" | "reg" | "name", value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
  onToggleAdvanced: () => void;
  onSortChange: (sort: BeagleSearchSort) => void;
}) {
  const { t } = useI18n();

  return (
    <section className={cn(beagleTheme.panel, "p-5")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className={cn(beagleTheme.headingMd, beagleTheme.inkStrongText)}>
            {t("search.form.title")}
          </h2>
          <p className={cn("mt-1 text-xs", beagleTheme.mutedText)}>
            {t("search.form.wildcardHelp")}
          </p>
        </div>
        <label className="space-y-1 text-xs">
          <span className={beagleTheme.mutedText}>
            {t("search.form.sort.label")}
          </span>
          <select
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as BeagleSearchSort)
            }
            className={cn(
              "h-9 rounded-md border bg-white px-2 text-sm",
              beagleTheme.border,
              beagleTheme.focusRing,
            )}
          >
            <option value="birth-desc">
              {t("search.form.sort.birthDesc")}
            </option>
            <option value="name-asc">{t("search.form.sort.nameAsc")}</option>
          </select>
        </label>
      </div>

      <form
        className="mt-4 grid gap-3 md:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) {
            onSubmit();
          }
        }}
      >
        <label className="space-y-1 text-xs">
          <span className={beagleTheme.mutedText}>
            {t("search.form.field.ek")}
          </span>
          <Input
            value={values.ek}
            onChange={(event) => onFieldChange("ek", event.target.value)}
            placeholder={t("search.form.field.ek")}
          />
        </label>

        <label className="space-y-1 text-xs">
          <span className={beagleTheme.mutedText}>
            {t("search.form.field.reg")}
          </span>
          <Input
            value={values.reg}
            onChange={(event) => onFieldChange("reg", event.target.value)}
            placeholder={t("search.form.field.reg")}
          />
        </label>

        <label className="space-y-1 text-xs">
          <span className={beagleTheme.mutedText}>
            {t("search.form.field.name")}
          </span>
          <Input
            value={values.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
            placeholder={t("search.form.field.name")}
          />
        </label>

        <div className="md:col-span-3 flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={!canSubmit || isPending}>
            {t("search.form.submit")}
          </Button>
          <Button type="button" variant="outline" onClick={onReset}>
            {t("search.form.reset")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onToggleAdvanced}
            aria-expanded={advancedOpen}
            className={cn(beagleTheme.focusRing, beagleTheme.inkStrongText)}
          >
            {advancedOpen
              ? t("search.form.advanced.toggle.close")
              : t("search.form.advanced.toggle.open")}
          </Button>
          <p
            className={cn(
              "text-xs",
              mode === "invalid" ? "text-red-700" : beagleTheme.mutedText,
            )}
          >
            {t(modeKeyMap[mode])}
          </p>
        </div>
      </form>

      {advancedOpen ? <BeagleSearchAdvancedPlaceholders /> : null}
    </section>
  );
}
