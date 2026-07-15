"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/i18n";

type DogPaginationProps = {
  page: number;
  totalPages: number;
  isPending: boolean;
  onPageChange: (page: number) => void;
};

export function DogPagination({
  page,
  totalPages,
  isPending,
  onPageChange,
}: DogPaginationProps) {
  const { t } = useI18n();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1 || isPending}
        onClick={() => onPageChange(page - 1)}
      >
        {t("admin.dogs.pagination.previous")}
      </Button>
      <span>
        {t("admin.dogs.pagination.page")} {page} / {totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= totalPages || isPending}
        onClick={() => onPageChange(page + 1)}
      >
        {t("admin.dogs.pagination.next")}
      </Button>
    </div>
  );
}
