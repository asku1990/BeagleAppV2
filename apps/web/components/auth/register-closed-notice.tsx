"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import { useI18n } from "@/hooks/i18n";

export function RegisterClosedNotice() {
  const { t } = useI18n();

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className={cn(beagleTheme.surface, beagleTheme.border)}>
        <CardHeader>
          <CardTitle>{t("auth.register.title")}</CardTitle>
          <CardDescription>
            {t("auth.register.closedDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("auth.register.contactAdmin")}
          </p>
          <Button asChild className="w-full">
            <Link href="/sign-in">{t("auth.register.signInCta")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
