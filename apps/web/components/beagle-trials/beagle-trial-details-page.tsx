import Link from "next/link";
import type { BeagleTrialDetailsResponse } from "@beagle/contracts";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { formatIsoDateForDisplay } from "@/lib/public/beagle/trials";
import { getDogProfileHref } from "@/lib/public/beagle/dogs/profile";
import { cn } from "@/lib/utils";

function mapSexLabel(
  value: "U" | "N" | "-",
  t: (
    key:
      | "trials.details.sex.male"
      | "trials.details.sex.female"
      | "trials.details.sex.unknown",
  ) => string,
): string {
  if (value === "U") return t("trials.details.sex.male");
  if (value === "N") return t("trials.details.sex.female");
  return t("trials.details.sex.unknown");
}

function formatPoints(points: number | null): string {
  if (points == null) {
    return "-";
  }
  return points.toLocaleString("fi-FI", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function BeagleTrialDetailsPage({
  details,
}: {
  details: BeagleTrialDetailsResponse;
}) {
  const { t, locale } = useI18n();

  return (
    <>
      <header className={cn(beagleTheme.panel, "px-5 py-5 md:px-6 md:py-6")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1
              className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}
            >
              {t("trials.details.title")}
            </h1>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {formatIsoDateForDisplay(details.trial.eventDate, locale)} •{" "}
              {details.trial.eventPlace}
            </p>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {t("trials.details.judge")}: {details.trial.judge ?? "-"}
            </p>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {t("trials.details.dogCount")}: {details.trial.dogCount}
            </p>
          </div>
        </div>
      </header>

      <ListingSectionShell title={t("trials.details.section.title")}>
        <ListingResponsiveResults
          desktop={
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] border-collapse text-sm">
                <thead>
                  <tr className={cn("border-b text-left", beagleTheme.border)}>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.reg")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.name")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.sex")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.weather")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.award")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.rank")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.points")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("trials.details.col.judge")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {details.items.map((row) => (
                    <tr
                      key={row.id}
                      className={cn("border-b align-top", beagleTheme.border)}
                    >
                      <td className="px-2 py-2">
                        <Link
                          href={getDogProfileHref(row.dogId)}
                          className={cn(
                            "font-medium underline underline-offset-2",
                            beagleTheme.inkStrongText,
                          )}
                        >
                          {row.registrationNo}
                        </Link>
                      </td>
                      <td className="px-2 py-2">
                        <Link
                          href={getDogProfileHref(row.dogId)}
                          className={cn(
                            "font-medium underline underline-offset-2",
                            beagleTheme.inkStrongText,
                          )}
                        >
                          {row.name}
                        </Link>
                      </td>
                      <td className="px-2 py-2">{mapSexLabel(row.sex, t)}</td>
                      <td className="px-2 py-2">{row.weather ?? "-"}</td>
                      <td className="px-2 py-2">{row.award ?? "-"}</td>
                      <td className="px-2 py-2">{row.rank ?? "-"}</td>
                      <td className="px-2 py-2">{formatPoints(row.points)}</td>
                      <td className="px-2 py-2">{row.judge ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
          mobile={
            <div className="space-y-2">
              {details.items.map((row) => (
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
                        {t("trials.details.col.reg")}:
                      </span>{" "}
                      <Link
                        href={getDogProfileHref(row.dogId)}
                        className={cn(
                          "font-medium underline underline-offset-2",
                          beagleTheme.inkStrongText,
                        )}
                      >
                        {row.registrationNo}
                      </Link>
                    </p>
                    <p className="col-span-2">
                      <span className={beagleTheme.mutedText}>
                        {t("trials.details.col.name")}:
                      </span>{" "}
                      <Link
                        href={getDogProfileHref(row.dogId)}
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
                        {t("trials.details.col.sex")}:
                      </span>{" "}
                      <span>{mapSexLabel(row.sex, t)}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("trials.details.col.weather")}:
                      </span>{" "}
                      <span>{row.weather ?? "-"}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("trials.details.col.award")}:
                      </span>{" "}
                      <span>{row.award ?? "-"}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("trials.details.col.rank")}:
                      </span>{" "}
                      <span>{row.rank ?? "-"}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("trials.details.col.points")}:
                      </span>{" "}
                      <span>{formatPoints(row.points)}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("trials.details.col.judge")}:
                      </span>{" "}
                      <span>{row.judge ?? "-"}</span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          }
        />
      </ListingSectionShell>
    </>
  );
}
