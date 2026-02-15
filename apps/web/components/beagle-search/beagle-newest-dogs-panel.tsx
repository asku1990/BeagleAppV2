import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n, type MessageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { BeagleNewestDogItem } from "@/lib/beagle-search";

function formatDate(value: string, locale: "fi" | "sv"): string {
  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const parsed = dateOnlyMatch
    ? new Date(
        Number.parseInt(dateOnlyMatch[1], 10),
        Number.parseInt(dateOnlyMatch[2], 10) - 1,
        Number.parseInt(dateOnlyMatch[3], 10),
      )
    : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "fi" ? "fi-FI" : "sv-FI").format(
    parsed,
  );
}

function mapSexLabel(
  sex: BeagleNewestDogItem["sex"],
  t: (key: MessageKey) => string,
) {
  return sex === "U"
    ? t("search.results.sex.male")
    : t("search.results.sex.female");
}

export function BeagleNewestDogsPanel({
  items,
  locale,
}: {
  items: BeagleNewestDogItem[];
  locale: "fi" | "sv";
}) {
  const { t } = useI18n();

  return (
    <section className={cn(beagleTheme.subpanel, "p-4")}>
      <h2 className={cn(beagleTheme.headingSm, beagleTheme.inkStrongText)}>
        {t("search.newest.title")}
      </h2>
      <p className={cn("mt-1 text-xs", beagleTheme.mutedText)}>
        {t("search.newest.subtitle")}
      </p>
      <ol className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li
            key={item.id}
            className={cn("rounded-md border p-2 text-xs", beagleTheme.border)}
          >
            <p className={cn("font-medium", beagleTheme.inkStrongText)}>
              {index + 1}. {item.name}
            </p>
            <p className={beagleTheme.mutedText}>
              {t("search.newest.registration")}: {item.registrationNo}
            </p>
            <p className={beagleTheme.mutedText}>
              {t("search.newest.birthDate")}:{" "}
              {formatDate(item.birthDate, locale)}
            </p>
            <p className={beagleTheme.mutedText}>{mapSexLabel(item.sex, t)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
