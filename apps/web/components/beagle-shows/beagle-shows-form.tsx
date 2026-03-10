import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";
import type {
  BeagleShowsFilterMode,
  BeagleShowsQueryState,
  BeagleShowSearchSort,
} from "@/lib/public/beagle/shows";

export function BeagleShowsForm({
  values,
  sort,
  isPending,
  canSubmit,
  availableYears,
  onModeChange,
  onYearChange,
  onDateFromChange,
  onDateToChange,
  onSortChange,
  onSubmit,
  onReset,
}: {
  values: Pick<BeagleShowsQueryState, "mode" | "year" | "dateFrom" | "dateTo">;
  sort: BeagleShowSearchSort;
  isPending: boolean;
  canSubmit: boolean;
  availableYears: number[];
  onModeChange: (mode: BeagleShowsFilterMode) => void;
  onYearChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSortChange: (sort: BeagleShowSearchSort) => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const { t } = useI18n();

  return (
    <Card className={cn(beagleTheme.panel, "gap-0 py-0")}>
      <CardHeader className="px-5 pt-5 pb-3 md:px-6 md:pt-6 md:pb-4">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle
              className={cn(beagleTheme.headingMd, beagleTheme.inkStrongText)}
            >
              {t("shows.form.title")}
            </CardTitle>
            <p className={cn("mt-1 text-xs", beagleTheme.mutedText)}>
              {t("shows.form.description")}
            </p>
          </div>
          <label className="space-y-1 text-xs sm:w-auto">
            <span className={cn(beagleTheme.mutedText, "mb-2 block")}>
              {t("shows.form.sort.label")}
            </span>
            <select
              value={sort}
              onChange={(event) =>
                onSortChange(event.target.value as BeagleShowSearchSort)
              }
              className={cn(
                "h-9 w-full min-w-0 rounded-md border bg-white px-2 text-sm sm:w-auto",
                beagleTheme.border,
                beagleTheme.focusRing,
              )}
            >
              <option value="date-desc">{t("shows.form.sort.dateDesc")}</option>
              <option value="date-asc">{t("shows.form.sort.dateAsc")}</option>
            </select>
          </label>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (canSubmit) {
              onSubmit();
            }
          }}
        >
          <fieldset className="space-y-2">
            <legend className={cn("text-xs", beagleTheme.mutedText)}>
              {t("shows.form.mode.label")}
            </legend>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="show-search-mode"
                  checked={values.mode === "year"}
                  onChange={() => onModeChange("year")}
                />
                <span>{t("shows.form.mode.year")}</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="show-search-mode"
                  checked={values.mode === "range"}
                  onChange={() => onModeChange("range")}
                />
                <span>{t("shows.form.mode.range")}</span>
              </label>
            </div>
          </fieldset>

          {values.mode === "year" ? (
            <label className="space-y-1 text-xs md:max-w-xs">
              <span className={beagleTheme.mutedText}>
                {t("shows.form.year.label")}
              </span>
              <Input
                value={values.year}
                onChange={(event) => onYearChange(event.target.value)}
                placeholder={t("shows.form.year.placeholder")}
                list="beagle-show-years"
                inputMode="numeric"
              />
              {availableYears.length > 0 ? (
                <datalist id="beagle-show-years">
                  {availableYears.map((year) => (
                    <option key={year} value={year} />
                  ))}
                </datalist>
              ) : null}
              <p className={cn("text-[11px]", beagleTheme.mutedText)}>
                {t("shows.form.year.helper")}
              </p>
            </label>
          ) : (
            <div className="grid gap-3 md:max-w-xl md:grid-cols-2">
              <label className="space-y-1 text-xs">
                <span className={beagleTheme.mutedText}>
                  {t("shows.form.dateFrom")}
                </span>
                <Input
                  type="date"
                  value={values.dateFrom}
                  onChange={(event) => onDateFromChange(event.target.value)}
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className={beagleTheme.mutedText}>
                  {t("shows.form.dateTo")}
                </span>
                <Input
                  type="date"
                  value={values.dateTo}
                  onChange={(event) => onDateToChange(event.target.value)}
                />
              </label>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" disabled={!canSubmit || isPending}>
              {t("shows.form.submit")}
            </Button>
            <Button type="button" variant="outline" onClick={onReset}>
              {t("shows.form.reset")}
            </Button>
            {!canSubmit && values.mode === "range" ? (
              <p className="text-xs text-red-700">
                {t("shows.form.rangeValidation")}
              </p>
            ) : null}
            {!canSubmit && values.mode === "year" ? (
              <p className="text-xs text-red-700">
                {t("shows.form.yearValidation")}
              </p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
