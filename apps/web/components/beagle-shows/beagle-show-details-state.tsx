import { ListingSectionShell } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import type { MessageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ShowDetailsStateVariant = "invalid" | "not-found";

const copy: Record<
  ShowDetailsStateVariant,
  { titleKey: MessageKey; descriptionKey: MessageKey }
> = {
  invalid: {
    titleKey: "shows.details.state.invalid.title",
    descriptionKey: "shows.details.state.invalid.description",
  },
  "not-found": {
    titleKey: "shows.details.state.notFound.title",
    descriptionKey: "shows.details.state.notFound.description",
  },
};

export function BeagleShowDetailsState({
  variant,
}: {
  variant: ShowDetailsStateVariant;
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
