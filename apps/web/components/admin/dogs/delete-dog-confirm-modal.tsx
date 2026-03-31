import { ConfirmModal } from "@/components/ui/confirm-modal";
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

  return dog ? (
    <ConfirmModal
      open={Boolean(dog)}
      title={t("admin.dogs.delete.title")}
      description={
        <>
          {t("admin.dogs.delete.descriptionPrefix")} <strong>{dog.name}</strong>{" "}
          ({dog.registrationNo ?? "-"}).
        </>
      }
      confirmLabel={t("admin.dogs.delete.confirm")}
      cancelLabel={t("admin.dogs.delete.cancel")}
      confirmVariant="destructive"
      isConfirming={isDeleting}
      confirmingLabel={t("admin.dogs.delete.confirming")}
      ariaLabel={t("admin.dogs.delete.modalAria")}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  ) : null;
}
