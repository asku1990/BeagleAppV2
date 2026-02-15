import { beagleTheme } from "@/components/ui/beagle-theme";
import type { BeagleSearchResultRow } from "@/lib/beagle-search";
import { useI18n, type MessageKey } from "@/lib/i18n";
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

export function BeagleSearchResultsTable({
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
              {t("search.results.col.trialsShows")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("search.results.col.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={cn("border-b align-top", beagleTheme.border)}
            >
              <td className="px-2 py-2">{row.registrationNo}</td>
              <td className="px-2 py-2">{row.ekNo == null ? "-" : row.ekNo}</td>
              <td className="px-2 py-2">{mapSexLabel(row.sex, t)}</td>
              <td className="px-2 py-2">
                <span
                  title={`${t("search.results.parents.sire")}: ${row.sire}\n${t("search.results.parents.dam")}: ${row.dam}`}
                  className={cn("font-medium", beagleTheme.inkStrongText)}
                >
                  {row.name}
                </span>
              </td>
              <td className="px-2 py-2">
                {row.trialCount} / {row.showCount}
              </td>
              <td className="px-2 py-2">
                <BeagleSearchRowActions />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
