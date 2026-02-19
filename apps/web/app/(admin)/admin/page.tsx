"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/i18n";

export default function AdminHomePage() {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("admin.home.title")}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.home.modules.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {t("admin.home.modules.description")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/account/profile">
                {t("admin.home.modules.openProfile")}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/users">
                {t("admin.home.modules.openUsers")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/dogs">{t("admin.home.modules.openDogs")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/settings">
                {t("admin.home.modules.openSettings")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
