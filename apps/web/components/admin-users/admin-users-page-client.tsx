"use client";

import { useMemo, useState } from "react";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@beagle/contracts";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createAdminUserAction } from "@/app/actions/admin/create-admin-user";
import { deleteAdminUserAction } from "@/app/actions/admin/delete-admin-user";
import { setAdminUserPasswordAction } from "@/app/actions/admin/set-admin-user-password";
import { setAdminUserStatusAction } from "@/app/actions/admin/set-admin-user-status";
import { useI18n } from "@/hooks/i18n";
import { useAdminUsersQuery } from "@/queries/admin/use-admin-users-query";

export function AdminUsersPageClient() {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useAdminUsersQuery();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [resetTarget, setResetTarget] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const filteredUsers = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return users;
    }

    return users.filter((user) => {
      return (
        user.email.toLowerCase().includes(trimmed) ||
        (user.name ?? "").toLowerCase().includes(trimmed)
      );
    });
  }, [query, users]);

  function getCreateUserErrorMessage(errorCode?: string): string {
    switch (errorCode) {
      case "EMAIL_EXISTS":
        return t("admin.users.create.errorEmailExists");
      case "INVALID_EMAIL":
        return t("admin.users.create.errorInvalidEmail");
      case "INVALID_PASSWORD":
        return t("admin.users.create.errorInvalidPassword");
      default:
        return t("admin.users.create.error");
    }
  }

  function getDeleteUserErrorMessage(errorCode?: string): string {
    switch (errorCode) {
      case "CANNOT_DELETE_SELF":
        return t("admin.users.delete.errorSelf");
      case "LAST_ADMIN":
        return t("admin.users.delete.errorLastAdmin");
      case "NOT_FOUND":
        return t("admin.users.delete.errorNotFound");
      default:
        return t("admin.users.delete.error");
    }
  }

  function getStatusUpdateErrorMessage(errorCode?: string): string {
    switch (errorCode) {
      case "CANNOT_SUSPEND_SELF":
        return t("admin.users.status.errorSelf");
      case "NOT_FOUND":
        return t("admin.users.status.errorNotFound");
      default:
        return t("admin.users.status.error");
    }
  }

  function getResetPasswordErrorMessage(errorCode?: string): string {
    switch (errorCode) {
      case "INVALID_PASSWORD":
        return t("admin.users.reset.errorInvalidPassword");
      case "NOT_FOUND":
        return t("admin.users.reset.errorNotFound");
      default:
        return t("admin.users.reset.error");
    }
  }

  async function onConfirmDeleteUser() {
    if (!deleteTarget) {
      return;
    }

    setIsDeletingUser(true);
    try {
      const result = await deleteAdminUserAction({ userId: deleteTarget.id });
      if (result.hasError) {
        toast.error(getDeleteUserErrorMessage(result.errorCode));
        return;
      }

      toast.success(t("admin.users.delete.success"));
      setDeleteTarget(null);
      await refetch();
    } catch {
      toast.error(t("admin.users.delete.error"));
    } finally {
      setIsDeletingUser(false);
    }
  }

  async function onCreateUser() {
    setIsCreatingUser(true);
    try {
      const result = await createAdminUserAction({
        email: createEmail,
        name: createName,
        role: "ADMIN",
        password: createPassword,
      });

      if (result.hasError) {
        toast.error(getCreateUserErrorMessage(result.errorCode));
        return;
      }

      toast.success(t("admin.users.create.success"));
      setCreateEmail("");
      setCreateName("");
      setCreatePassword("");
      setIsCreateOpen(false);
      await refetch();
    } catch {
      toast.error(t("admin.users.create.error"));
    } finally {
      setIsCreatingUser(false);
    }
  }

  async function onToggleSuspend(user: {
    id: string;
    status: "active" | "suspended";
  }) {
    const nextStatus = user.status === "active" ? "suspended" : "active";
    const successMessage =
      nextStatus === "suspended"
        ? t("admin.users.status.suspendedSuccess")
        : t("admin.users.status.unsuspendedSuccess");

    try {
      const result = await setAdminUserStatusAction({
        userId: user.id,
        status: nextStatus,
      });
      if (result.hasError) {
        toast.error(getStatusUpdateErrorMessage(result.errorCode));
        return;
      }

      toast.success(successMessage);
      await refetch();
    } catch {
      toast.error(t("admin.users.status.error"));
    }
  }

  async function onResetPasswordConfirm() {
    if (!resetTarget) {
      return;
    }

    if (resetPassword !== resetPasswordConfirm) {
      toast.error(t("admin.users.reset.passwordMismatch"));
      return;
    }

    setIsResettingPassword(true);
    try {
      const result = await setAdminUserPasswordAction({
        userId: resetTarget.id,
        newPassword: resetPassword,
      });
      if (result.hasError) {
        toast.error(getResetPasswordErrorMessage(result.errorCode));
        return;
      }

      toast.success(t("admin.users.reset.success"));
      setResetTarget(null);
      setResetPassword("");
      setResetPasswordConfirm("");
    } catch {
      toast.error(t("admin.users.reset.error"));
    } finally {
      setIsResettingPassword(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("admin.users.title")}
        </h1>
        <Button type="button" onClick={() => setIsCreateOpen((prev) => !prev)}>
          {isCreateOpen
            ? t("admin.users.create.toggleClose")
            : t("admin.users.create.toggleOpen")}
        </Button>
      </div>

      {isCreateOpen ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("admin.users.create.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={createEmail}
              onChange={(event) => setCreateEmail(event.target.value)}
              type="email"
              placeholder={t("admin.users.create.emailPlaceholder")}
            />
            <Input
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              placeholder={t("admin.users.create.namePlaceholder")}
            />
            <Input
              value={createPassword}
              onChange={(event) => setCreatePassword(event.target.value)}
              type="password"
              placeholder={t("admin.users.create.passwordPlaceholder")}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => void onCreateUser()}
                disabled={isCreatingUser}
              >
                {isCreatingUser
                  ? t("admin.users.create.submitting")
                  : t("admin.users.create.submit")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setCreateEmail("");
                  setCreateName("");
                  setCreatePassword("");
                }}
                disabled={isCreatingUser}
              >
                {t("admin.users.create.cancel")}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.users.management.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">
              {t("admin.users.loading")}
            </p>
          ) : null}
          {isError ? (
            <div className="flex items-center justify-between gap-3 rounded-md border p-3">
              <p className="text-sm text-muted-foreground">
                {t("admin.users.fetchError")}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void refetch()}
                disabled={isFetching}
              >
                {t("admin.users.retry")}
              </Button>
            </div>
          ) : null}
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("admin.users.searchPlaceholder")}
            aria-label={t("admin.users.searchAria")}
            disabled={isLoading || isError}
          />

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-2 py-2">
                    {t("admin.users.columns.email")}
                  </th>
                  <th className="px-2 py-2">{t("admin.users.columns.name")}</th>
                  <th className="px-2 py-2">{t("admin.users.columns.role")}</th>
                  <th className="px-2 py-2">
                    {t("admin.users.columns.status")}
                  </th>
                  <th className="px-2 py-2">
                    {t("admin.users.columns.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b align-top">
                    <td className="px-2 py-2">{user.email}</td>
                    <td className="px-2 py-2">{user.name ?? "-"}</td>
                    <td className="px-2 py-2">{user.role}</td>
                    <td className="px-2 py-2">{user.status}</td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setResetTarget({ id: user.id, email: user.email });
                            setResetPassword("");
                            setResetPasswordConfirm("");
                          }}
                        >
                          {t("admin.users.actions.resetPassword")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void onToggleSuspend(user)}
                        >
                          {user.status === "active"
                            ? t("admin.users.actions.suspend")
                            : t("admin.users.actions.unsuspend")}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDeleteTarget({ id: user.id, email: user.email })
                          }
                        >
                          {t("admin.users.actions.delete")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="space-y-3 pt-4">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.name ?? "-"}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p>
                      {t("admin.users.mobile.roleLabel")}: {user.role}
                    </p>
                    <p>
                      {t("admin.users.mobile.statusLabel")}: {user.status}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setResetTarget({ id: user.id, email: user.email });
                        setResetPassword("");
                        setResetPasswordConfirm("");
                      }}
                    >
                      {t("admin.users.actions.resetPassword")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void onToggleSuspend(user)}
                    >
                      {user.status === "active"
                        ? t("admin.users.actions.suspend")
                        : t("admin.users.actions.unsuspend")}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setDeleteTarget({ id: user.id, email: user.email })
                      }
                    >
                      {t("admin.users.actions.delete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {resetTarget ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t("admin.users.reset.modalAria")}
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t("admin.users.reset.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t("admin.users.reset.descriptionPrefix")}{" "}
                <strong>{resetTarget.email}</strong>.
              </p>
              <Input
                type="password"
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
                placeholder={t("admin.users.reset.passwordPlaceholder")}
              />
              <Input
                type="password"
                value={resetPasswordConfirm}
                onChange={(event) =>
                  setResetPasswordConfirm(event.target.value)
                }
                placeholder={t("admin.users.reset.confirmPasswordPlaceholder")}
              />
              <p className="text-xs text-muted-foreground">
                {t("admin.users.reset.passwordHint")} ({PASSWORD_MIN_LENGTH}-
                {PASSWORD_MAX_LENGTH})
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => void onResetPasswordConfirm()}
                  disabled={isResettingPassword}
                >
                  {isResettingPassword
                    ? t("admin.users.reset.confirming")
                    : t("admin.users.reset.confirm")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setResetTarget(null);
                    setResetPassword("");
                    setResetPasswordConfirm("");
                  }}
                  disabled={isResettingPassword}
                >
                  {t("admin.users.reset.cancel")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
      {deleteTarget ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t("admin.users.delete.modalAria")}
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t("admin.users.delete.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("admin.users.delete.descriptionPrefix")}{" "}
                <strong>{deleteTarget.email}</strong>.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => void onConfirmDeleteUser()}
                  disabled={isDeletingUser}
                >
                  {isDeletingUser
                    ? t("admin.users.delete.confirming")
                    : t("admin.users.delete.confirm")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeletingUser}
                >
                  {t("admin.users.delete.cancel")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
