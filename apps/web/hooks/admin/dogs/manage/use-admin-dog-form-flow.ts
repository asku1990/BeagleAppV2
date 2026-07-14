"use client";

import { useState } from "react";
import type {
  CalculateAdminDogInbreedingRequest,
  CalculateAdminDogInbreedingResponse,
  CreateAdminDogRequest,
  DeleteAdminDogRequest,
  DogStatus,
  UpdateAdminDogRequest,
} from "@beagle/contracts";
import { toast } from "@/components/ui/sonner";
import type {
  AdminDogFormValues,
  AdminDogRecord,
} from "@/components/admin/dogs/types";
import type { MessageKey } from "@/lib/i18n/messages";
import {
  createEmptyAdminDogFormValues,
  getAdminDogMutationErrorCode,
  getAdminDogMutationErrorMessageKey,
  mapAdminDogToFormValues,
  toCreateAdminDogRequest,
  toUpdateAdminDogRequest,
} from "@/lib/admin/dogs/manage";

type AdminDogMutation<Request, Response = unknown> = {
  isPending: boolean;
  mutateAsync: (input: Request) => Promise<Response>;
};

type UseAdminDogFormFlowInput = {
  t: (key: MessageKey) => string;
  calculateInbreedingMutation: AdminDogMutation<
    CalculateAdminDogInbreedingRequest,
    CalculateAdminDogInbreedingResponse
  >;
  createDogMutation: AdminDogMutation<CreateAdminDogRequest>;
  updateDogMutation: AdminDogMutation<UpdateAdminDogRequest>;
  deleteDogMutation: AdminDogMutation<DeleteAdminDogRequest>;
};

type DogFormState = {
  open: boolean;
  mode: "create" | "edit";
  target: AdminDogRecord | null;
  createStatus: DogStatus;
};

// Owns admin dog modal/form state and mutation orchestration without UI concerns.
export function useAdminDogFormFlow({
  t,
  calculateInbreedingMutation,
  createDogMutation,
  updateDogMutation,
  deleteDogMutation,
}: UseAdminDogFormFlowInput) {
  const [deleteTarget, setDeleteTarget] = useState<AdminDogRecord | null>(null);
  const [formState, setFormState] = useState<DogFormState>({
    open: false,
    mode: "create",
    target: null,
    createStatus: "NORMAL",
  });
  const [formValues, setFormValues] = useState<AdminDogFormValues>(
    createEmptyAdminDogFormValues,
  );
  const [ownerLookupQuery, setOwnerLookupQuery] = useState("");
  const [parentLookupQuery, setParentLookupQuery] = useState("");

  function resetLookups() {
    setOwnerLookupQuery("");
    setParentLookupQuery("");
  }

  function openCreateModal() {
    resetLookups();
    setFormValues(createEmptyAdminDogFormValues());
    setFormState({
      open: true,
      mode: "create",
      target: null,
      createStatus: "NORMAL",
    });
  }

  function openEditModal(dog: AdminDogRecord) {
    resetLookups();
    setFormValues(mapAdminDogToFormValues(dog));
    setFormState({
      open: true,
      mode: "edit",
      target: dog,
      createStatus: "NORMAL",
    });
  }

  function closeFormModal() {
    setFormState((current) => ({ ...current, open: false }));
  }

  function handleValuesChange(values: AdminDogFormValues) {
    if (
      formValues.sirePreviewRegistrationNo !==
        values.sirePreviewRegistrationNo ||
      formValues.damPreviewRegistrationNo !== values.damPreviewRegistrationNo
    ) {
      setFormValues({ ...values, inbreedingCoefficientPct: null });
      return;
    }

    setFormValues(values);
  }

  async function handleCalculateInbreeding() {
    try {
      const result = await calculateInbreedingMutation.mutateAsync({
        sireRegistrationNo: formValues.sirePreviewRegistrationNo,
        damRegistrationNo: formValues.damPreviewRegistrationNo,
      });
      setFormValues({
        ...formValues,
        inbreedingCoefficientPct: result.inbreedingCoefficientPct,
      });
    } catch (error) {
      toast.error(
        t(
          getAdminDogMutationErrorMessageKey(
            getAdminDogMutationErrorCode(error),
          ),
        ),
      );
    }
  }

  async function handleSubmit(values: AdminDogFormValues) {
    if (formState.mode === "create") {
      try {
        await createDogMutation.mutateAsync(
          toCreateAdminDogRequest(values, formState.createStatus),
        );
        toast.success(t("admin.dogs.create.success"));
        setFormState({
          open: false,
          mode: "create",
          target: null,
          createStatus: "NORMAL",
        });
      } catch (error) {
        toast.error(
          t(
            getAdminDogMutationErrorMessageKey(
              getAdminDogMutationErrorCode(error),
            ),
          ),
        );
      }
      return;
    }

    if (!formState.target) {
      return;
    }

    try {
      await updateDogMutation.mutateAsync(
        toUpdateAdminDogRequest(values, formState.target),
      );
      toast.success(t("admin.dogs.edit.success"));
      setFormState({
        open: false,
        mode: "create",
        target: null,
        createStatus: "NORMAL",
      });
    } catch (error) {
      toast.error(
        t(
          getAdminDogMutationErrorMessageKey(
            getAdminDogMutationErrorCode(error),
          ),
        ),
      );
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteDogMutation.mutateAsync({ id: deleteTarget.id });
      toast.success(t("admin.dogs.delete.success"));
      setDeleteTarget(null);
    } catch (error) {
      toast.error(
        t(
          getAdminDogMutationErrorMessageKey(
            getAdminDogMutationErrorCode(error),
          ),
        ),
      );
    }
  }

  return {
    deleteTarget,
    setDeleteTarget,
    formState,
    formValues,
    createStatus: formState.createStatus,
    setCreateStatus: (createStatus: DogStatus) =>
      setFormState((current) => ({ ...current, createStatus })),
    setFormValues: handleValuesChange,
    ownerLookupQuery,
    setOwnerLookupQuery,
    parentLookupQuery,
    setParentLookupQuery,
    openCreateModal,
    openEditModal,
    closeFormModal,
    handleCalculateInbreeding,
    handleSubmit,
    handleDeleteConfirm,
    isCalculatingInbreeding: calculateInbreedingMutation.isPending,
    isSubmitting: createDogMutation.isPending || updateDogMutation.isPending,
    isDeleting: deleteDogMutation.isPending,
  };
}
