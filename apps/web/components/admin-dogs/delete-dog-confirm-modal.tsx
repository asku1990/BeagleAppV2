import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/hooks/i18n";
import type { AdminDogRecord } from "./types";

type DeleteDogConfirmModalProps = {
  dog: AdminDogRecord | null;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteDogConfirmModal({
  dog,
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteDogConfirmModalProps) {
  const { t } = useI18n();

  if (!dog) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("admin.dogs.delete.modalAria")}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("admin.dogs.delete.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("admin.dogs.delete.descriptionPrefix")}{" "}
            <strong>{dog.name}</strong> ({dog.registrationNo ?? "-"}).
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting
                ? t("admin.dogs.delete.confirming")
                : t("admin.dogs.delete.confirm")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isDeleting}
            >
              {t("admin.dogs.delete.cancel")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
