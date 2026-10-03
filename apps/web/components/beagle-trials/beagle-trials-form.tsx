import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";
import type {
  BeagleTrialsFilterMode,
  BeagleTrialsQueryState,
  BeagleTrialSearchSort,
} from "@/lib/public/beagle/trials";

export function BeagleTrialsForm({
  values,
  sort,
  isPending,
  canSubmit,
  availableSeasons,
  onModeChange,
  onSeasonChange,
  onDateFromChange,
  onDateToChange,
  onSortChange,
  onSubmit,
  onReset,
}: {
  values: Pick<
    BeagleTrialsQueryState,
    "mode" | "season" | "dateFrom" | "dateTo"
  >;
  sort: BeagleTrialSearchSort;
  isPending: boolean;
  canSubmit: boolean;
  availableSeasons: string[];
  onModeChange: (mode: BeagleTrialsFilterMode) => void;
  onSeasonChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onSortChange: (sort: BeagleTrialSearchSort) => void;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const { t } = useI18n();
  const selectedSeason = values.season || availableSeasons[0] || "";

  return (
    <Card className={cn(beagleTheme.panel, "gap-0 py-0")}>
      <CardHeader className="px-5 pt-5 pb-3 md:px-6 md:pt-6 md:pb-4">
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle
              className={cn(beagleTheme.headingMd, beagleTheme.inkStrongText)}
            >
              {t("trials.form.title")}
            </CardTitle>
            <p className={cn("mt-1 text-xs", beagleTheme.mutedText)}>
              {t("trials.form.description")}
            </p>
          </div>
          <label className="space-y-1 text-xs sm:w-auto">
            <span className={cn(beagleTheme.mutedText, "mb-2 block")}>
              {t("trials.form.sort.label")}
            </span>
            <select
              value={sort}
              onChange={(event) =>
                onSortChange(event.target.value as BeagleTrialSearchSort)
              }
              className={cn(
                "h-9 w-full min-w-0 rounded-md border bg-white px-2 text-sm sm:w-auto",
                beagleTheme.border,
                beagleTheme.focusRing,
              )}
            >
              <option value="date-desc">
                {t("trials.form.sort.dateDesc")}
              </option>
              <option value="date-asc">{t("trials.form.sort.dateAsc")}</option>
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
              {t("trials.form.mode.label")}
            </legend>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="trial-search-mode"
                  checked={values.mode === "season"}
                  onChange={() => onModeChange("season")}
                />
                <span>{t("trials.form.mode.season")}</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="trial-search-mode"
                  checked={values.mode === "range"}
                  onChange={() => onModeChange("range")}
                />
                <span>{t("trials.form.mode.range")}</span>
              </label>
            </div>
          </fieldset>

          {values.mode === "season" ? (
            <label className="space-y-1 text-xs md:max-w-xs">
              <span className={beagleTheme.mutedText}>
                {t("trials.form.season.label")}
              </span>
              <select
                value={selectedSeason}
                onChange={(event) => onSeasonChange(event.target.value)}
                className={cn(
                  "h-9 w-full min-w-0 rounded-md border bg-white px-2 text-sm",
                  beagleTheme.border,
                  beagleTheme.focusRing,
                )}
              >
                {availableSeasons.map((season) => (
                  <option key={season} value={season}>
                    {season}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="grid gap-3 md:max-w-xl md:grid-cols-2">
              <label className="space-y-1 text-xs">
                <span className={beagleTheme.mutedText}>
                  {t("trials.form.dateFrom")}
                </span>
                <Input
                  type="date"
                  value={values.dateFrom}
                  onChange={(event) => onDateFromChange(event.target.value)}
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className={beagleTheme.mutedText}>
                  {t("trials.form.dateTo")}
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
              {t("trials.form.submit")}
            </Button>
            <Button type="button" variant="outline" onClick={onReset}>
              {t("trials.form.reset")}
            </Button>
            {!canSubmit && values.mode === "range" ? (
              <p className="text-xs text-red-700">
                {t("trials.form.rangeValidation")}
              </p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
