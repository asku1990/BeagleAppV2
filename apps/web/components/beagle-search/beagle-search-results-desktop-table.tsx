import Link from "next/link";
import { beagleTheme } from "@/components/ui/beagle-theme";
import type { BeagleSearchResultRow } from "@/lib/public/beagle/search";
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

export function BeagleSearchResultsDesktopTable({
  rows,
}: {
  rows: BeagleSearchResultRow[];
}) {
  const { t } = useI18n();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] border-collapse text-sm">
        <thead>
          <tr className={cn("border-b text-left", beagleTheme.border)}>
            <th className="px-2 py-2 font-semibold">
              {t("search.results.col.reg")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("search.results.col.ek")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("search.results.col.sex")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("search.results.col.name")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("search.results.col.trials")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("search.results.col.shows")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("search.results.col.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const additionalRegistrationNos = row.registrationNos.filter(
              (registrationNo) => registrationNo !== row.registrationNo,
            );

            return (
              <tr
                key={row.id}
                className={cn("border-b align-top", beagleTheme.border)}
              >
                <td className="px-2 py-2">
                  <Link
                    href={getDogProfileHref(row.id)}
                    className={cn(
                      "font-medium underline underline-offset-2",
                      beagleTheme.inkStrongText,
                    )}
                  >
                    {row.registrationNo}
                  </Link>
                  {additionalRegistrationNos.length > 0 ? (
                    <div className={cn("mt-1 text-xs", beagleTheme.mutedText)}>
                      {t("search.results.col.regAll")}:{" "}
                      {additionalRegistrationNos.join(", ")}
                    </div>
                  ) : null}
                </td>
                <td className="px-2 py-2">
                  {row.ekNo == null ? "-" : row.ekNo}
                </td>
                <td className="px-2 py-2">{mapSexLabel(row.sex, t)}</td>
                <td className="px-2 py-2">
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
                </td>
                <td className="px-2 py-2">{row.trialCount}</td>
                <td className="px-2 py-2">{row.showCount}</td>
                <td className="px-2 py-2">
                  <BeagleSearchRowActions />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
