import { ListingSectionShell } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import type { DogProfile } from "@/lib/beagle-dogs";

const FALLBACK_VALUE = "-";

function formatParent(parent: DogProfile["sire"]): string {
  if (!parent) {
    return FALLBACK_VALUE;
  }

  const registrationNo = parent.registrationNo?.trim() ?? "";
  return registrationNo ? `${parent.name} (${registrationNo})` : parent.name;
}

export function DogProfilePedigreeCard({ profile }: { profile: DogProfile }) {
  const { t } = useI18n();

  return (
    <ListingSectionShell title={t("dog.profile.card.pedigree.title")}>
      <dl className="space-y-2 text-sm">
        <div className="grid grid-cols-[120px_1fr] gap-3">
          <dt className={beagleTheme.mutedText}>
            {t("dog.profile.field.sire")}
          </dt>
          <dd>{formatParent(profile.sire)}</dd>
        </div>
        <div className="grid grid-cols-[120px_1fr] gap-3">
          <dt className={beagleTheme.mutedText}>
            {t("dog.profile.field.dam")}
          </dt>
          <dd>{formatParent(profile.dam)}</dd>
        </div>
      </dl>
    </ListingSectionShell>
  );
}
