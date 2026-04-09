"use client";

import { useState } from "react";
import type {
  CreateAdminDogRequest,
  DeleteAdminDogRequest,
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

type AdminDogMutation<Request> = {
  isPending: boolean;
  mutateAsync: (input: Request) => Promise<unknown>;
};

type UseAdminDogFormFlowInput = {
  t: (key: MessageKey) => string;
  createDogMutation: AdminDogMutation<CreateAdminDogRequest>;
  updateDogMutation: AdminDogMutation<UpdateAdminDogRequest>;
  deleteDogMutation: AdminDogMutation<DeleteAdminDogRequest>;
};

type DogFormState = {
  open: boolean;
  mode: "create" | "edit";
  target: AdminDogRecord | null;
};

// Owns admin dog modal/form state and mutation orchestration without UI concerns.
export function useAdminDogFormFlow({
  t,
  createDogMutation,
  updateDogMutation,
  deleteDogMutation,
}: UseAdminDogFormFlowInput) {
  const [deleteTarget, setDeleteTarget] = useState<AdminDogRecord | null>(null);
  const [formState, setFormState] = useState<DogFormState>({
    open: false,
    mode: "create",
    target: null,
  });
  const [formValues, setFormValues] = useState<AdminDogFormValues>(
    createEmptyAdminDogFormValues,
  );
  const [breederLookupQuery, setBreederLookupQuery] = useState("");
  const [ownerLookupQuery, setOwnerLookupQuery] = useState("");
  const [parentLookupQuery, setParentLookupQuery] = useState("");

  function resetLookups() {
    setBreederLookupQuery("");
    setOwnerLookupQuery("");
    setParentLookupQuery("");
  }

  function openCreateModal() {
    resetLookups();
    setFormValues(createEmptyAdminDogFormValues());
    setFormState({ open: true, mode: "create", target: null });
  }

  function openEditModal(dog: AdminDogRecord) {
    resetLookups();
    setFormValues(mapAdminDogToFormValues(dog));
    setFormState({ open: true, mode: "edit", target: dog });
  }

  function closeFormModal() {
    setFormState((current) => ({ ...current, open: false }));
  }

  async function handleSubmit(values: AdminDogFormValues) {
    if (formState.mode === "create") {
      try {
        await createDogMutation.mutateAsync(toCreateAdminDogRequest(values));
        toast.success(t("admin.dogs.create.success"));
        setFormState({ open: false, mode: "create", target: null });
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
      setFormState({ open: false, mode: "create", target: null });
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
    setFormValues,
    breederLookupQuery,
    setBreederLookupQuery,
    ownerLookupQuery,
    setOwnerLookupQuery,
    parentLookupQuery,
    setParentLookupQuery,
    openCreateModal,
    openEditModal,
    closeFormModal,
    handleSubmit,
    handleDeleteConfirm,
    isSubmitting: createDogMutation.isPending || updateDogMutation.isPending,
    isDeleting: deleteDogMutation.isPending,
  };
}
