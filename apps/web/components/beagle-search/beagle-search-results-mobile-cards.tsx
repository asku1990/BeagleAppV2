import Link from "next/link";
import { beagleTheme } from "@/components/ui/beagle-theme";
import type { BeagleSearchResultRow } from "@/lib/beagle-search";
import { getDogProfileHref } from "@/lib/public/beagle/dogs/profile";
import type { MessageKey } from "@/lib/i18n";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";
import { BeagleSearchRowActions } from "./beagle-search-row-actions";

function mapSexLabel(
  sex: BeagleSearchResultRow["sex"],
  t: (key: MessageKey) => string,
) {
  if (sex === "U") return t("search.results.sex.male");
  if (sex === "N") return t("search.results.sex.female");
  return "-";
}

export function BeagleSearchResultsMobileCards({
  rows,
}: {
  rows: BeagleSearchResultRow[];
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const additionalRegistrationNos = row.registrationNos.filter(
          (registrationNo) => registrationNo !== row.registrationNo,
        );

        return (
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
                <Link
                  href={getDogProfileHref(row.id)}
                  className={cn(
                    "font-medium underline underline-offset-2",
                    beagleTheme.inkStrongText,
                  )}
                >
                  {row.registrationNo}
                </Link>
              </p>
              {additionalRegistrationNos.length > 0 ? (
                <p className="col-span-2">
                  <span className={beagleTheme.mutedText}>
                    {t("search.results.col.regAll")}:{" "}
                  </span>
                  <span>{additionalRegistrationNos.join(", ")}</span>
                </p>
              ) : null}
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
                <Link
                  href={getDogProfileHref(row.id)}
                  title={`${t("search.results.parents.sire")}: ${row.sire}\n${t("search.results.parents.dam")}: ${row.dam}`}
                  className={cn(
                    "font-medium underline underline-offset-2",
                    beagleTheme.inkStrongText,
                  )}
                >
                  {row.name}
                </Link>
              </p>
              <p>
                <span className={beagleTheme.mutedText}>
                  {t("search.results.col.trials")}:
                </span>{" "}
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    beagleTheme.inkStrongText,
                  )}
                >
                  {row.trialCount}
                </span>
              </p>
              <p>
                <span className={beagleTheme.mutedText}>
                  {t("search.results.col.shows")}:
                </span>{" "}
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    beagleTheme.inkStrongText,
                  )}
                >
                  {row.showCount}
                </span>
              </p>
            </div>
            <BeagleSearchRowActions className="mt-2" />
          </article>
        );
      })}
    </div>
  );
}
