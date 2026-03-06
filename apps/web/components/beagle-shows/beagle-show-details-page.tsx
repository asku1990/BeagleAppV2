import Link from "next/link";
import type { BeagleShowDetailsResponse } from "@beagle/contracts";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { formatIsoDateForDisplay } from "@/lib/public/beagle/shows";
import { getDogProfileHref } from "@/lib/public/beagle/dogs/profile";
import { cn } from "@/lib/utils";

function mapSexLabel(
  value: "U" | "N" | "-",
  t: (
    key:
      | "shows.details.sex.male"
      | "shows.details.sex.female"
      | "shows.details.sex.unknown",
  ) => string,
): string {
  if (value === "U") return t("shows.details.sex.male");
  if (value === "N") return t("shows.details.sex.female");
  return t("shows.details.sex.unknown");
}

function formatHeight(heightCm: number | null): string {
  if (heightCm == null) {
    return "-";
  }
  return `${heightCm} cm`;
}

export function BeagleShowDetailsPage({
  details,
}: {
  details: BeagleShowDetailsResponse;
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
              {t("shows.details.title")}
            </h1>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {formatIsoDateForDisplay(details.show.eventDate, locale)} •{" "}
              {details.show.eventPlace}
            </p>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {t("shows.details.judge")}: {details.show.judge ?? "-"}
            </p>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {t("shows.details.dogCount")}: {details.show.dogCount}
            </p>
          </div>
        </div>
      </header>

      <ListingSectionShell title={t("shows.details.section.title")}>
        <ListingResponsiveResults
          desktop={
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead>
                  <tr className={cn("border-b text-left", beagleTheme.border)}>
                    <th className="px-2 py-2 font-semibold">
                      {t("shows.details.col.reg")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("shows.details.col.name")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("shows.details.col.sex")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("shows.details.col.result")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("shows.details.col.height")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("shows.details.col.judge")}
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
                      <td className="px-2 py-2">{row.result ?? "-"}</td>
                      <td className="px-2 py-2">
                        {formatHeight(row.heightCm)}
                      </td>
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
                        {t("shows.details.col.reg")}:
                      </span>
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
                        {t("shows.details.col.name")}:
                      </span>
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
                        {t("shows.details.col.sex")}:
                      </span>
                      <span>{mapSexLabel(row.sex, t)}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("shows.details.col.result")}:
                      </span>
                      <span>{row.result ?? "-"}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("shows.details.col.height")}:
                      </span>
                      <span>{formatHeight(row.heightCm)}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("shows.details.col.judge")}:
                      </span>
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
