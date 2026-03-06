import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";

type EmptyVariant = "no-results" | "error";

const messageKeyByVariant: Record<
  EmptyVariant,
  "trials.empty.noResults" | "trials.empty.error"
> = {
  "no-results": "trials.empty.noResults",
  error: "trials.empty.error",
};

export function BeagleTrialsEmptyState({
  variant,
  message,
}: {
  variant: EmptyVariant;
  message?: string;
}) {
  const { t } = useI18n();
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-8 text-center text-sm",
        beagleTheme.border,
        beagleTheme.mutedText,
      )}
    >
      {message ?? t(messageKeyByVariant[variant])}
    </div>
  );
}
