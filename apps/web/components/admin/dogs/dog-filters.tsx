import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/i18n";
import type { AdminDogSex } from "./types";

type DogFiltersProps = {
  query: string;
  sex: "all" | AdminDogSex;
  onQueryChange: (value: string) => void;
  onSexChange: (value: "all" | AdminDogSex) => void;
};

export function DogFilters({
  query,
  sex,
  onQueryChange,
  onSexChange,
}: DogFiltersProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={t("admin.dogs.filters.searchPlaceholder")}
        aria-label={t("admin.dogs.filters.searchAria")}
      />
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label={t("admin.dogs.filters.sexAria")}
      >
        <Button
          type="button"
          size="sm"
          variant={sex === "all" ? "default" : "outline"}
          onClick={() => onSexChange("all")}
        >
          {t("admin.dogs.filters.sex.all")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={sex === "MALE" ? "default" : "outline"}
          onClick={() => onSexChange("MALE")}
        >
          {t("admin.dogs.sex.male")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={sex === "FEMALE" ? "default" : "outline"}
          onClick={() => onSexChange("FEMALE")}
        >
          {t("admin.dogs.sex.female")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={sex === "UNKNOWN" ? "default" : "outline"}
          onClick={() => onSexChange("UNKNOWN")}
        >
          {t("admin.dogs.sex.unknown")}
        </Button>
      </div>
    </div>
  );
}
