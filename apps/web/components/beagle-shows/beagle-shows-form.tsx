import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { beagleTheme } from "@/components/ui/beagle-theme";
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
  return (
    <Card className={cn(beagleTheme.panel, "gap-0 py-0")}>
      <CardHeader className="px-5 pt-5 pb-3 md:px-6 md:pt-6 md:pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle
              className={cn(beagleTheme.headingMd, beagleTheme.inkStrongText)}
            >
              Hae näyttelyitä
            </CardTitle>
            <p className={cn("mt-1 text-xs", beagleTheme.mutedText)}>
              Hae vuoden perusteella tai valitse tarkka aikaväli.
            </p>
          </div>
          <label className="space-y-1 text-xs">
            <span className={cn(beagleTheme.mutedText, "mb-2 block")}>
              Järjestys
            </span>
            <select
              value={sort}
              onChange={(event) =>
                onSortChange(event.target.value as BeagleShowSearchSort)
              }
              className={cn(
                "h-9 rounded-md border bg-white px-2 text-sm",
                beagleTheme.border,
                beagleTheme.focusRing,
              )}
            >
              <option value="date-desc">Uusin ensin</option>
              <option value="date-asc">Vanhin ensin</option>
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
              Hakutapa
            </legend>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="show-search-mode"
                  checked={values.mode === "year"}
                  onChange={() => onModeChange("year")}
                />
                <span>Vuosihaku</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="show-search-mode"
                  checked={values.mode === "range"}
                  onChange={() => onModeChange("range")}
                />
                <span>Aikaväli</span>
              </label>
            </div>
          </fieldset>

          {values.mode === "year" ? (
            <label className="space-y-1 text-xs md:max-w-xs">
              <span className={beagleTheme.mutedText}>Vuosi</span>
              <Input
                value={values.year}
                onChange={(event) => onYearChange(event.target.value)}
                placeholder="esim. 2025"
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
                Jätä tyhjäksi hakeaksesi uusimman vuoden.
              </p>
            </label>
          ) : (
            <div className="grid gap-3 md:max-w-xl md:grid-cols-2">
              <label className="space-y-1 text-xs">
                <span className={beagleTheme.mutedText}>Päivä alkaen</span>
                <Input
                  type="date"
                  value={values.dateFrom}
                  onChange={(event) => onDateFromChange(event.target.value)}
                />
              </label>
              <label className="space-y-1 text-xs">
                <span className={beagleTheme.mutedText}>Päivä asti</span>
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
              Hae
            </Button>
            <Button type="button" variant="outline" onClick={onReset}>
              Tyhjennä
            </Button>
            {!canSubmit && values.mode === "range" ? (
              <p className="text-xs text-red-700">
                Valitse sekä alkupäivä että loppupäivä.
              </p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
