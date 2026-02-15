import { beagleTheme } from "@/components/ui/beagle-theme";
import type { BeagleSearchResultRow } from "@/lib/beagle-search";
import { useI18n, type MessageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { BeagleSearchRowActions } from "./beagle-search-row-actions";

function mapSexLabel(
  sex: BeagleSearchResultRow["sex"],
  t: (key: MessageKey) => string,
) {
  return sex === "U"
    ? t("search.results.sex.male")
    : t("search.results.sex.female");
}

export function BeagleSearchResultsCards({
  rows,
}: {
  rows: BeagleSearchResultRow[];
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <article
          key={row.id}
          className={cn(
            "rounded-lg border p-3",
            beagleTheme.border,
            beagleTheme.surface,
          )}
        >
          <div className="grid grid-cols-2 gap-2 text-xs">
            <p className="col-span-2">
              <span className={beagleTheme.mutedText}>
                {t("search.results.col.reg")}:{" "}
              </span>
              <span>{row.registrationNo}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("search.results.col.ek")}:{" "}
              </span>
              <span>{row.ekNo == null ? "-" : row.ekNo}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("search.results.col.sex")}:{" "}
              </span>
              <span>{mapSexLabel(row.sex, t)}</span>
            </p>
            <p className="col-span-2">
              <span className={beagleTheme.mutedText}>
                {t("search.results.col.name")}:{" "}
              </span>
              <span className={cn("font-medium", beagleTheme.inkStrongText)}>
                {row.name}
              </span>
            </p>
            <p className="col-span-2">
              <span className={beagleTheme.mutedText}>
                {t("search.results.col.trialsShows")}:
              </span>
              <span>
                {row.trialCount} / {row.showCount}
              </span>
            </p>
          </div>
          <p className={cn("mt-2 text-xs", beagleTheme.mutedText)}>
            {t("search.results.parents.sire")}: {row.sire}
            <br />
            {t("search.results.parents.dam")}: {row.dam}
          </p>
          <BeagleSearchRowActions className="mt-2" />
        </article>
      ))}
    </div>
  );
}
