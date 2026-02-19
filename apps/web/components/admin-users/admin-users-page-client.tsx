"use client";

import { useMemo, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminUsersQuery } from "@/queries/admin/use-admin-users-query";

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("fi-FI");
}

export function AdminUsersPageClient() {
  const [query, setQuery] = useState("");
  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useAdminUsersQuery();
  const [resetTargetId, setResetTargetId] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState("");

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

  function onToggleRole() {
    toast.info("Role update action comes in next step");
  }

  function onToggleSuspend() {
    toast.info("Suspend action comes in next step");
  }

  function onResetPasswordConfirm() {
    if (!resetTargetId) {
      return;
    }

    if (tempPassword.trim().length < 12) {
      toast.error("Temporary password must be at least 12 characters");
      return;
    }

    toast.success("Mock action: reset password queued");
    setTempPassword("");
    setResetTargetId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Users</h1>
        <Button
          type="button"
          onClick={() => toast.info("Create user form comes in next step")}
        >
          Create user
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading users...</p>
          ) : null}
          {isError ? (
            <div className="flex items-center justify-between gap-3 rounded-md border p-3">
              <p className="text-sm text-muted-foreground">
                Failed to load users.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => void refetch()}
                disabled={isFetching}
              >
                Retry
              </Button>
            </div>
          ) : null}
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by email or name"
            aria-label="Search users"
            disabled={isLoading || isError}
          />

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Name</th>
                  <th className="px-2 py-2">Role</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Last sign-in</th>
                  <th className="px-2 py-2">Actions</th>
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
                      {formatDateTime(user.lastSignInAt)}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setResetTargetId(user.id);
                            setTempPassword("");
                          }}
                        >
                          Reset password
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={onToggleRole}
                        >
                          Toggle role
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={onToggleSuspend}
                        >
                          {user.status === "active" ? "Suspend" : "Unsuspend"}
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
                    <p>Role: {user.role}</p>
                    <p>Status: {user.status}</p>
                    <p>Last sign-in: {formatDateTime(user.lastSignInAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setResetTargetId(user.id);
                        setTempPassword("");
                      }}
                    >
                      Reset password
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onToggleRole}
                    >
                      Toggle role
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onToggleSuspend}
                    >
                      {user.status === "active" ? "Suspend" : "Unsuspend"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {resetTargetId ? (
        <Card>
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="password"
              value={tempPassword}
              onChange={(event) => setTempPassword(event.target.value)}
              placeholder="Temporary password (12+ chars)"
            />
            <div className="flex gap-2">
              <Button type="button" onClick={onResetPasswordConfirm}>
                Confirm reset
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setResetTargetId(null);
                  setTempPassword("");
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
