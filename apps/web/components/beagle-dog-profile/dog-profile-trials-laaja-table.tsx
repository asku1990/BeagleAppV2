"use client";

import Link from "next/link";
import { Fragment, useMemo } from "react";
import { ListingResponsiveResults } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { getBeagleTrialHref } from "@/lib/public/beagle/trials";
import {
  FALLBACK_VALUE,
  formatDate,
  formatNumber,
  formatPlacement,
} from "@/lib/public/beagle/trials/display-formatters";
import { cn } from "@/lib/utils";
import type { BeagleDogProfileTrialRowDto } from "@beagle/contracts";
import { DogProfileTrialsEraDesktopRow } from "./internal/trials-laaja/dog-profile-trials-era-desktop-row";
import { DogProfileTrialsLaajaMobileList } from "./internal/trials-laaja/dog-profile-trials-laaja-mobile-list";
import type { DogProfileTrialsLaajaHeaders } from "./internal/trials-laaja/dog-profile-trials-laaja-types";

export function DogProfileTrialsLaajaTable({
  rows,
  showEraDetails,
}: {
  rows: BeagleDogProfileTrialRowDto[];
  showEraDetails: boolean;
}) {
  const { t, locale } = useI18n();
  const hasTja = rows.some((row) => row.tja != null);
  const hasPin = rows.some((row) => row.pin != null);
  const hasVisibleEras =
    showEraDetails && rows.some((row) => row.eras && row.eras.length > 0);
  const hasEraHuomautus =
    hasVisibleEras &&
    rows.some((row) => row.eras?.some((era) => era.huomautusTeksti != null));
  const visibleColumns = {
    hasEraHuomautus,
    hasTja,
    hasPin,
  };
  const headers = useMemo<DogProfileTrialsLaajaHeaders>(
    () => ({
      no: t("dog.profile.trials.col.no"),
      place: t("dog.profile.trials.col.place"),
      date: t("dog.profile.trials.col.date"),
      weather: t("dog.profile.trials.col.weather"),
      award: t("dog.profile.trials.col.class"),
      rank: t("dog.profile.trials.col.rank"),
      points: t("dog.profile.trials.col.points"),
      judge: t("trials.details.col.judge"),
      haku: t("trials.details.copy.col.searchWork"),
      hauk: t("trials.details.copy.col.barking"),
      ajotaito: t("trials.details.copy.col.ajotaito"),
      hlo: t("trials.details.copy.col.searchLoosenessPenalty"),
      alo: t("trials.details.copy.col.chaseLoosenessPenalty"),
      tja: t("trials.details.copy.col.obstacleWork"),
      pin: t("trials.details.copy.col.mi"),
      era: t("dog.profile.trials.eras.col.era"),
      alkoi: t("dog.profile.trials.eras.col.alkoi"),
      hakumin: t("dog.profile.trials.eras.col.hakumin"),
      ajomin: t("dog.profile.trials.eras.col.ajomin"),
      huomautus: t("dog.profile.trials.eras.col.huomautus"),
    }),
    [t],
  );

  return (
    <ListingResponsiveResults
      desktop={
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1360px] border-collapse text-sm">
            <thead>
              <tr className={cn("border-b text-left", beagleTheme.border)}>
                <th className="px-2 py-2 font-semibold">{headers.no}</th>
                <th className="px-2 py-2 font-semibold">{headers.place}</th>
                <th className="px-2 py-2 font-semibold">{headers.date}</th>
                <th className="px-2 py-2 font-semibold">{headers.weather}</th>
                <th className="px-2 py-2 font-semibold">{headers.award}</th>
                <th className="px-2 py-2 font-semibold">{headers.rank}</th>
                <th className="px-2 py-2 font-semibold">{headers.points}</th>
                <th className="px-2 py-2 font-semibold">{headers.haku}</th>
                <th className="px-2 py-2 font-semibold">{headers.hauk}</th>
                <th className="px-2 py-2 font-semibold">{headers.ajotaito}</th>
                <th className="px-2 py-2 font-semibold">{headers.hlo}</th>
                <th className="px-2 py-2 font-semibold">{headers.alo}</th>
                <th className="px-2 py-2 font-semibold">{headers.judge}</th>
                {hasEraHuomautus ? (
                  <th className="px-2 py-2 font-semibold">
                    {headers.huomautus}
                  </th>
                ) : null}
                {hasTja ? (
                  <th className="px-2 py-2 font-semibold">{headers.tja}</th>
                ) : null}
                {hasPin ? (
                  <th className="px-2 py-2 font-semibold">{headers.pin}</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <Fragment key={row.id}>
                  <tr
                    className={cn(
                      "border-b align-top text-sm font-medium",
                      beagleTheme.border,
                      beagleTheme.inkStrongText,
                    )}
                  >
                    <td className="px-2 py-2">{index + 1}</td>
                    <td className="px-2 py-2">
                      <Link
                        href={getBeagleTrialHref(row.trialId)}
                        className={beagleTheme.entityLink}
                      >
                        {row.place}
                      </Link>
                    </td>
                    <td className="px-2 py-2">
                      {formatDate(row.date, locale)}
                    </td>
                    <td className="px-2 py-2">
                      {row.weather ?? FALLBACK_VALUE}
                    </td>
                    <td className="px-2 py-2">{row.award ?? FALLBACK_VALUE}</td>
                    <td className="px-2 py-2">{formatPlacement(row)}</td>
                    <td className="px-2 py-2">{formatNumber(row.points)}</td>
                    <td className="px-2 py-2">{formatNumber(row.haku)}</td>
                    <td className="px-2 py-2">{formatNumber(row.hauk)}</td>
                    <td className="px-2 py-2">{formatNumber(row.yva)}</td>
                    <td className="px-2 py-2">{formatNumber(row.hlo)}</td>
                    <td className="px-2 py-2">{formatNumber(row.alo)}</td>
                    <td className="px-2 py-2">{row.judge ?? FALLBACK_VALUE}</td>
                    {hasEraHuomautus ? <td className="px-2 py-2" /> : null}
                    {hasTja ? (
                      <td className="px-2 py-2">{formatNumber(row.tja)}</td>
                    ) : null}
                    {hasPin ? (
                      <td className="px-2 py-2">{formatNumber(row.pin)}</td>
                    ) : null}
                  </tr>
                  {hasVisibleEras && row.eras && row.eras.length > 0
                    ? row.eras.map((era) => (
                        <DogProfileTrialsEraDesktopRow
                          key={`${row.id}-era-${era.era}`}
                          rowId={row.id}
                          era={era}
                          headers={headers}
                          columns={visibleColumns}
                        />
                      ))
                    : null}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      }
      mobile={
        <DogProfileTrialsLaajaMobileList
          rows={rows}
          headers={headers}
          showEraDetails={showEraDetails}
          locale={locale}
        />
      }
    />
  );
}
