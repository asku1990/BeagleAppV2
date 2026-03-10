"use client";

import { FeatureHeroHeader } from "@/components/layout";
import { useI18n } from "@/hooks/i18n";

export function MainHeader() {
  const { t } = useI18n();

  return (
    <FeatureHeroHeader
      logoAlt={t("home.hero.logoAlt")}
      title={t("home.hero.title")}
      description={t("home.hero.description")}
    />
  );
}
