import { Button } from "@/components/ui/button";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { BEAGLE_PAGE_SIZE } from "@/lib/beagle-search";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";

export function BeagleSearchPagination({
  page,
  total,
  totalPages,
  onPrevious,
  onNext,
}: {
  page: number;
  total: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const { t } = useI18n();

  if (total === 0) {
    return null;
  }

  const start = (page - 1) * BEAGLE_PAGE_SIZE + 1;
  const end = Math.min(total, page * BEAGLE_PAGE_SIZE);

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={page <= 1}
      >
        {t("search.pagination.previous")}
      </Button>
      <p className={cn("text-sm", beagleTheme.mutedText)}>
        {t("search.pagination.range")} {start}-{end} / {total}
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={onNext}
        disabled={page >= totalPages}
      >
        {t("search.pagination.next")}
      </Button>
    </div>
  );
}
