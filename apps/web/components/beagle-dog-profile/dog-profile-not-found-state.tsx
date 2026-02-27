import Link from "next/link";
import { ListingSectionShell } from "@/components/listing";
import { Button } from "@/components/ui/button";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";

export function DogProfileNotFoundState() {
  const { t } = useI18n();

  return (
    <ListingSectionShell title={t("dog.profile.notFound.title")}>
      <p className={cn("text-sm", beagleTheme.mutedText)}>
        {t("dog.profile.notFound.description")}
      </p>
      <div className="mt-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/beagle/search">{t("dog.profile.notFound.backCta")}</Link>
        </Button>
      </div>
    </ListingSectionShell>
  );
}
