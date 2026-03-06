import { ListingSectionShell } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import type { MessageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type TrialDetailsStateVariant = "invalid" | "not-found";

const copy: Record<
  TrialDetailsStateVariant,
  { titleKey: MessageKey; descriptionKey: MessageKey }
> = {
  invalid: {
    titleKey: "trials.details.state.invalid.title",
    descriptionKey: "trials.details.state.invalid.description",
  },
  "not-found": {
    titleKey: "trials.details.state.notFound.title",
    descriptionKey: "trials.details.state.notFound.description",
  },
};

export function BeagleTrialDetailsState({
  variant,
}: {
  variant: TrialDetailsStateVariant;
}) {
  const { t } = useI18n();

  return (
    <ListingSectionShell title={t(copy[variant].titleKey)}>
      <p className={cn("text-sm", beagleTheme.mutedText)}>
        {t(copy[variant].descriptionKey)}
      </p>
    </ListingSectionShell>
  );
}
