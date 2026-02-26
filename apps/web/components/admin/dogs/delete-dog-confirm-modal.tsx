import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  return (
    <Dialog
      open={Boolean(dog)}
      onOpenChange={(nextOpen) => (nextOpen ? null : onCancel())}
    >
      <DialogContent
        className="max-w-md"
        aria-label={t("admin.dogs.delete.modalAria")}
      >
        <DialogHeader>
          <DialogTitle>{t("admin.dogs.delete.title")}</DialogTitle>
        </DialogHeader>
        {dog ? (
          <div className="space-y-4">
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
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
