"use client";

import Link from "next/link";
import { useMemo } from "react";
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

function DogProfileTrialsLaajaMobileList({
  rows,
  headers,
  locale,
}: {
  rows: BeagleDogProfileTrialRowDto[];
  headers: {
    no: string;
    place: string;
    date: string;
    weather: string;
    award: string;
    rank: string;
    points: string;
    judge: string;
    haku: string;
    hauk: string;
    ajotaito: string;
    hlo: string;
    alo: string;
    tja: string;
    pin: string;
  };
  locale: "fi" | "sv";
}) {
  const hasWeather = rows.some((row) => row.weather != null);
  const hasAward = rows.some((row) => row.award != null);
  const hasRank = rows.some(
    (row) => row.rank != null || row.koetyyppi !== "NORMAL",
  );
  const hasPoints = rows.some((row) => row.points != null);
  const hasHaku = rows.some((row) => row.haku != null);
  const hasHauk = rows.some((row) => row.hauk != null);
  const hasAjotaito = rows.some((row) => row.yva != null);
  const hasHlo = rows.some((row) => row.hlo != null);
  const hasAlo = rows.some((row) => row.alo != null);
  const hasJudge = rows.some((row) => row.judge != null);
  const hasTja = rows.some((row) => row.tja != null);
  const hasPin = rows.some((row) => row.pin != null);

  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <article
          key={row.id}
          className={cn(
            "rounded-lg border p-3",
            beagleTheme.border,
            beagleTheme.surface,
          )}
        >
          <div className="grid grid-cols-2 gap-2 text-xs">
            <p>
              <span className={beagleTheme.mutedText}>{headers.no}:</span>{" "}
              <span>{index + 1}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>{headers.date}:</span>{" "}
              <span>{formatDate(row.date, locale)}</span>
            </p>
            <p className="col-span-2">
              <span className={beagleTheme.mutedText}>{headers.place}:</span>{" "}
              <Link
                href={getBeagleTrialHref(row.trialId)}
                className={beagleTheme.entityLink}
              >
                {row.place}
              </Link>
            </p>
            {hasWeather ? (
              <p>
                <span className={beagleTheme.mutedText}>
                  {headers.weather}:
                </span>{" "}
                <span>{row.weather ?? FALLBACK_VALUE}</span>
              </p>
            ) : null}
            {hasAward ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.award}:</span>{" "}
                <span>{row.award ?? FALLBACK_VALUE}</span>
              </p>
            ) : null}
            {hasRank ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.rank}:</span>{" "}
                <span>{formatPlacement(row)}</span>
              </p>
            ) : null}
            {hasPoints ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.points}:</span>{" "}
                <span>{formatNumber(row.points)}</span>
              </p>
            ) : null}
            {hasHaku ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.haku}:</span>{" "}
                <span>{formatNumber(row.haku)}</span>
              </p>
            ) : null}
            {hasHauk ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.hauk}:</span>{" "}
                <span>{formatNumber(row.hauk)}</span>
              </p>
            ) : null}
            {hasAjotaito ? (
              <p>
                <span className={beagleTheme.mutedText}>
                  {headers.ajotaito}:
                </span>{" "}
                <span>{formatNumber(row.yva)}</span>
              </p>
            ) : null}
            {hasHlo ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.hlo}:</span>{" "}
                <span>{formatNumber(row.hlo)}</span>
              </p>
            ) : null}
            {hasAlo ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.alo}:</span>{" "}
                <span>{formatNumber(row.alo)}</span>
              </p>
            ) : null}
            {hasJudge ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.judge}:</span>{" "}
                <span>{row.judge ?? FALLBACK_VALUE}</span>
              </p>
            ) : null}
            {hasTja ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.tja}:</span>{" "}
                <span>{formatNumber(row.tja)}</span>
              </p>
            ) : null}
            {hasPin ? (
              <p>
                <span className={beagleTheme.mutedText}>{headers.pin}:</span>{" "}
                <span>{formatNumber(row.pin)}</span>
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export function DogProfileTrialsLaajaTable({
  rows,
}: {
  rows: BeagleDogProfileTrialRowDto[];
}) {
  const { t, locale } = useI18n();
  const hasWeather = rows.some((row) => row.weather != null);
  const hasAward = rows.some((row) => row.award != null);
  const hasRank = rows.some(
    (row) => row.rank != null || row.koetyyppi !== "NORMAL",
  );
  const hasPoints = rows.some((row) => row.points != null);
  const hasHaku = rows.some((row) => row.haku != null);
  const hasHauk = rows.some((row) => row.hauk != null);
  const hasAjotaito = rows.some((row) => row.yva != null);
  const hasHlo = rows.some((row) => row.hlo != null);
  const hasAlo = rows.some((row) => row.alo != null);
  const hasJudge = rows.some((row) => row.judge != null);
  const hasTja = rows.some((row) => row.tja != null);
  const hasPin = rows.some((row) => row.pin != null);
  const headers = useMemo(
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
                {hasWeather ? (
                  <th className="px-2 py-2 font-semibold">{headers.weather}</th>
                ) : null}
                {hasAward ? (
                  <th className="px-2 py-2 font-semibold">{headers.award}</th>
                ) : null}
                {hasRank ? (
                  <th className="px-2 py-2 font-semibold">{headers.rank}</th>
                ) : null}
                {hasPoints ? (
                  <th className="px-2 py-2 font-semibold">{headers.points}</th>
                ) : null}
                {hasHaku ? (
                  <th className="px-2 py-2 font-semibold">{headers.haku}</th>
                ) : null}
                {hasHauk ? (
                  <th className="px-2 py-2 font-semibold">{headers.hauk}</th>
                ) : null}
                {hasAjotaito ? (
                  <th className="px-2 py-2 font-semibold">
                    {headers.ajotaito}
                  </th>
                ) : null}
                {hasHlo ? (
                  <th className="px-2 py-2 font-semibold">{headers.hlo}</th>
                ) : null}
                {hasAlo ? (
                  <th className="px-2 py-2 font-semibold">{headers.alo}</th>
                ) : null}
                {hasJudge ? (
                  <th className="px-2 py-2 font-semibold">{headers.judge}</th>
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
                <tr
                  key={row.id}
                  className={cn("border-b align-top", beagleTheme.border)}
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
                  <td className="px-2 py-2">{formatDate(row.date, locale)}</td>
                  {hasWeather ? (
                    <td className="px-2 py-2">
                      {row.weather ?? FALLBACK_VALUE}
                    </td>
                  ) : null}
                  {hasAward ? (
                    <td className="px-2 py-2">{row.award ?? FALLBACK_VALUE}</td>
                  ) : null}
                  {hasRank ? (
                    <td className="px-2 py-2">{formatPlacement(row)}</td>
                  ) : null}
                  {hasPoints ? (
                    <td className="px-2 py-2">{formatNumber(row.points)}</td>
                  ) : null}
                  {hasHaku ? (
                    <td className="px-2 py-2">{formatNumber(row.haku)}</td>
                  ) : null}
                  {hasHauk ? (
                    <td className="px-2 py-2">{formatNumber(row.hauk)}</td>
                  ) : null}
                  {hasAjotaito ? (
                    <td className="px-2 py-2">{formatNumber(row.yva)}</td>
                  ) : null}
                  {hasHlo ? (
                    <td className="px-2 py-2">{formatNumber(row.hlo)}</td>
                  ) : null}
                  {hasAlo ? (
                    <td className="px-2 py-2">{formatNumber(row.alo)}</td>
                  ) : null}
                  {hasJudge ? (
                    <td className="px-2 py-2">{row.judge ?? FALLBACK_VALUE}</td>
                  ) : null}
                  {hasTja ? (
                    <td className="px-2 py-2">{formatNumber(row.tja)}</td>
                  ) : null}
                  {hasPin ? (
                    <td className="px-2 py-2">{formatNumber(row.pin)}</td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      mobile={
        <DogProfileTrialsLaajaMobileList
          rows={rows}
          headers={headers}
          locale={locale}
        />
      }
    />
  );
}
