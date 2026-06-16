"use client";

import { FeatureHeroHeader } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";

export default function VirtualPairingEpiInfoPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <FeatureHeroHeader
        logoAlt={t("beagle.virtualPairing.page.logoAlt")}
        title={t("beagle.virtualPairing.epiInfo.title")}
      />
      <Card className={beagleTheme.panel}>
        <CardHeader className="px-5 pb-3 pt-5 md:px-6 md:pt-6 md:pb-4">
          <CardTitle className={beagleTheme.headingMd}>
            {t("beagle.virtualPairing.epiInfo.headline")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-5 pb-5 text-sm leading-6 md:px-6 md:pb-6">
          <p>{t("beagle.virtualPairing.epiInfo.intro")}</p>
          <p>{t("beagle.virtualPairing.epiInfo.paragraph2")}</p>
          <p>{t("beagle.virtualPairing.epiInfo.paragraph3")}</p>
          <p>{t("beagle.virtualPairing.epiInfo.paragraph4")}</p>
          <p>{t("beagle.virtualPairing.epiInfo.riskIntro")}</p>
          <div className="space-y-3 rounded-lg border bg-background/60 p-4">
            <ul className="list-disc space-y-3 pl-5">
              <li>{t("beagle.virtualPairing.epiInfo.risk.oneTwo")}</li>
              <li>{t("beagle.virtualPairing.epiInfo.risk.threeFive")}</li>
              <li>{t("beagle.virtualPairing.epiInfo.risk.sixEight")}</li>
            </ul>
          </div>
          <p>{t("beagle.virtualPairing.epiInfo.closing")}</p>
          <p className="pt-2">{t("beagle.virtualPairing.epiInfo.signature")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
