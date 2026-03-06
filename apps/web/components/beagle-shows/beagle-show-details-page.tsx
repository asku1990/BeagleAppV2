import Link from "next/link";
import type { BeagleShowDetailsResponse } from "@beagle/contracts";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { formatIsoDateForDisplay } from "@/lib/public/beagle/shows";
import { getDogProfileHref } from "@/lib/public/beagle/dogs/profile";
import { cn } from "@/lib/utils";

function mapSexLabel(value: "U" | "N" | "-"): string {
  if (value === "U") return "Uros";
  if (value === "N") return "Narttu";
  return "-";
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
  return (
    <>
      <header className={cn(beagleTheme.panel, "px-5 py-5 md:px-6 md:py-6")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1
              className={cn(beagleTheme.headingLg, beagleTheme.inkStrongText)}
            >
              Näyttelyn tulokset
            </h1>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              {formatIsoDateForDisplay(details.show.eventDate)} •{" "}
              {details.show.eventPlace}
            </p>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              Tuomari: {details.show.judge ?? "-"}
            </p>
            <p className={cn("mt-1 text-sm", beagleTheme.mutedText)}>
              Koiria: {details.show.dogCount}
            </p>
          </div>
        </div>
      </header>

      <ListingSectionShell title="Koirat ja tulokset">
        <ListingResponsiveResults
          desktop={
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead>
                  <tr className={cn("border-b text-left", beagleTheme.border)}>
                    <th className="px-2 py-2 font-semibold">Rek.nro</th>
                    <th className="px-2 py-2 font-semibold">Nimi</th>
                    <th className="px-2 py-2 font-semibold">Sukupuoli</th>
                    <th className="px-2 py-2 font-semibold">Tulos</th>
                    <th className="px-2 py-2 font-semibold">Korkeus</th>
                    <th className="px-2 py-2 font-semibold">Tuomari</th>
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
                      <td className="px-2 py-2">{mapSexLabel(row.sex)}</td>
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
                      <span className={beagleTheme.mutedText}>Rek.nro: </span>
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
                      <span className={beagleTheme.mutedText}>Nimi: </span>
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
                      <span className={beagleTheme.mutedText}>Sukupuoli: </span>
                      <span>{mapSexLabel(row.sex)}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>Tulos: </span>
                      <span>{row.result ?? "-"}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>Korkeus: </span>
                      <span>{formatHeight(row.heightCm)}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>Tuomari: </span>
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
