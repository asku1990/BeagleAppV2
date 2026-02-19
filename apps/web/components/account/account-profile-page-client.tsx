"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/i18n";
import type { SessionCurrentUser } from "@/lib/server/current-user";

type AccountProfilePageClientProps = {
  user: SessionCurrentUser;
};

export function AccountProfilePageClient({
  user,
}: AccountProfilePageClientProps) {
  const { t, locale } = useI18n();
  const createdAt = user.createdAt ? new Date(user.createdAt) : null;
  const localeTag = locale === "fi" ? "fi-FI" : "sv-FI";
  const formattedCreatedAt =
    createdAt && !Number.isNaN(createdAt.getTime())
      ? new Intl.DateTimeFormat(localeTag, {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(createdAt)
      : t("account.profile.emptyValue");
  const roleLabel =
    user.role === "ADMIN"
      ? t("account.profile.role.admin")
      : t("account.profile.role.user");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("account.profile.title")}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>{t("account.profile.cardTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">
              {t("account.profile.field.name")}:
            </span>{" "}
            {user.name ?? t("account.profile.emptyValue")}
          </p>
          <p>
            <span className="font-medium">
              {t("account.profile.field.email")}:
            </span>{" "}
            {user.email}
          </p>
          <p>
            <span className="font-medium">
              {t("account.profile.field.role")}:
            </span>{" "}
            {roleLabel}
          </p>
          <p>
            <span className="font-medium">
              {t("account.profile.field.created")}:
            </span>{" "}
            {formattedCreatedAt}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
