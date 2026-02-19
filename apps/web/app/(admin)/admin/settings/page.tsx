"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/i18n";

export default function AdminSettingsPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("admin.settings.title")}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.settings.placeholder.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("admin.settings.placeholder.description")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
