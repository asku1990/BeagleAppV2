"use client";

import { FeatureHeroHeader } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";

export default function VirtualPairingEpiInfoPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <FeatureHeroHeader
        logoAlt={t("beagle.virtualPairing.page.logoAlt")}
        title={t("beagle.virtualPairing.epiInfo.title")}
        description={t("beagle.virtualPairing.epiInfo.description")}
      />
      <Card className={beagleTheme.panel}>
        <CardContent className="space-y-4 px-5 py-5 md:px-6 md:py-6">
          <p className="text-sm leading-6">
            {t("beagle.virtualPairing.epiInfo.paragraph2")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
