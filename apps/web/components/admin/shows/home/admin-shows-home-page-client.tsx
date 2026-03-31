"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/i18n";

type ShowModuleCardProps = {
  title: string;
  description: string;
  actionLabel: string;
  href?: string;
};

function ShowModuleCard({
  title,
  description,
  actionLabel,
  href,
}: ShowModuleCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        {href ? (
          <Button asChild>
            <Link href={href}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button type="button" variant="outline" disabled>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminShowsHomePageClient() {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("admin.shows.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.shows.description")}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ShowModuleCard
          title={t("admin.shows.import.title")}
          description={t("admin.shows.home.import.description")}
          actionLabel={t("admin.shows.home.import.open")}
          href="/admin/shows/import"
        />
        <ShowModuleCard
          title={t("admin.shows.runs.title")}
          description={t("admin.shows.home.runs.description")}
          actionLabel={t("admin.shows.home.runs.comingSoon")}
        />
        <ShowModuleCard
          title={t("admin.shows.search.title")}
          description={t("admin.shows.home.search.description")}
          actionLabel="Open search"
          href="/admin/shows/manage"
        />
      </div>
    </div>
  );
}
