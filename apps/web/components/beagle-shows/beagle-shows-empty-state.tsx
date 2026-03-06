import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";

type EmptyVariant = "no-results" | "error";

const messageKeyByVariant: Record<
  EmptyVariant,
  "shows.empty.noResults" | "shows.empty.error"
> = {
  "no-results": "shows.empty.noResults",
  error: "shows.empty.error",
};

export function BeagleShowsEmptyState({
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
