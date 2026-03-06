import { ListingSectionShell } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";

type ShowDetailsStateVariant = "invalid" | "not-found";

const copy: Record<
  ShowDetailsStateVariant,
  { title: string; description: string }
> = {
  invalid: {
    title: "Virheellinen näyttelytunniste",
    description:
      "Linkki on virheellinen tai puuttuu. Avaa näyttely uudelleen hakusivulta.",
  },
  "not-found": {
    title: "Näyttelyä ei löytynyt",
    description:
      "Näyttelyä ei löytynyt annetulla tunnisteella. Se on voitu poistaa tai linkki on vanhentunut.",
  },
};

export function BeagleShowDetailsState({
  variant,
}: {
  variant: ShowDetailsStateVariant;
}) {
  return (
    <ListingSectionShell title={copy[variant].title}>
      <p className={cn("text-sm", beagleTheme.mutedText)}>
        {copy[variant].description}
      </p>
    </ListingSectionShell>
  );
}
