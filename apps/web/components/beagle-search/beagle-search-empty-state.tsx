import { beagleTheme } from "@/components/ui/beagle-theme";
import type { MessageKey } from "@/lib/i18n";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";

type EmptyVariant = "start" | "invalid" | "no-results" | "error";

const messageKeyByVariant: Record<EmptyVariant, MessageKey> = {
  start: "search.empty.start",
  invalid: "search.empty.singleField",
  "no-results": "search.empty.noMatches",
  error: "search.empty.fetchFailed",
};

export function BeagleSearchEmptyState({ variant }: { variant: EmptyVariant }) {
  const { t } = useI18n();

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-8 text-center text-sm",
        beagleTheme.border,
        beagleTheme.mutedText,
      )}
    >
      {t(messageKeyByVariant[variant])}
    </div>
  );
}
