import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";

type EmptyVariant = "no-results" | "error";

const messageByVariant: Record<EmptyVariant, string> = {
  "no-results": "Hakuehdoilla ei löytynyt näyttelyitä.",
  error: "Näyttelyiden haku epäonnistui. Yritä uudelleen.",
};

export function BeagleShowsEmptyState({
  variant,
  message,
}: {
  variant: EmptyVariant;
  message?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-8 text-center text-sm",
        beagleTheme.border,
        beagleTheme.mutedText,
      )}
    >
      {message ?? messageByVariant[variant]}
    </div>
  );
}
