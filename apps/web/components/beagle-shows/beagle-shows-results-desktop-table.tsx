import Link from "next/link";
import type { BeagleShowSearchRow } from "@beagle/contracts";
import { beagleTheme } from "@/components/ui/beagle-theme";
import {
  formatIsoDateForDisplay,
  getBeagleShowHref,
} from "@/lib/public/beagle/shows";
import { cn } from "@/lib/utils";

export function BeagleShowsResultsDesktopTable({
  rows,
}: {
  rows: BeagleShowSearchRow[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className={cn("border-b text-left", beagleTheme.border)}>
            <th className="px-2 py-2 font-semibold">Päivä</th>
            <th className="px-2 py-2 font-semibold">Paikka</th>
            <th className="px-2 py-2 font-semibold">Tuomari</th>
            <th className="px-2 py-2 font-semibold">Koiria</th>
            <th className="px-2 py-2 font-semibold">Tuloslista</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.showId}
              className={cn("border-b align-top", beagleTheme.border)}
            >
              <td className="px-2 py-2">
                {formatIsoDateForDisplay(row.eventDate)}
              </td>
              <td className="px-2 py-2">{row.eventPlace}</td>
              <td className="px-2 py-2">{row.judge ?? "-"}</td>
              <td className="px-2 py-2">{row.dogCount}</td>
              <td className="px-2 py-2">
                <Link
                  href={getBeagleShowHref(row.showId)}
                  className={cn(
                    "font-medium underline underline-offset-2",
                    beagleTheme.inkStrongText,
                  )}
                >
                  Avaa näyttely
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
