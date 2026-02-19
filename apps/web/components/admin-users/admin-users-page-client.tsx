"use client";

import { useMemo, useState } from "react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  status: "active" | "suspended";
  lastSignInAt: string;
};

const MOCK_USERS: AdminUser[] = [
  {
    id: "u_1",
    email: "admin@beagle.test",
    name: "Main Admin",
    role: "ADMIN",
    status: "active",
    lastSignInAt: "2026-02-18 15:20",
  },
  {
    id: "u_2",
    email: "editor@beagle.test",
    name: "Editor User",
    role: "USER",
    status: "active",
    lastSignInAt: "2026-02-17 10:12",
  },
  {
    id: "u_3",
    email: "blocked@beagle.test",
    name: "Blocked User",
    role: "USER",
    status: "suspended",
    lastSignInAt: "2026-02-10 07:45",
  },
];

function nextRole(current: "ADMIN" | "USER"): "ADMIN" | "USER" {
  return current === "ADMIN" ? "USER" : "ADMIN";
}

export function AdminUsersPageClient() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS);
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
        user.name.toLowerCase().includes(trimmed)
      );
    });
  }, [query, users]);

  function onToggleRole(userId: string) {
    setUsers((previous) =>
      previous.map((user) =>
        user.id === userId ? { ...user, role: nextRole(user.role) } : user,
      ),
    );
    toast.success("Mock action: role updated in UI state");
  }

  function onToggleSuspend(userId: string) {
    setUsers((previous) =>
      previous.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "active" ? "suspended" : "active",
            }
          : user,
      ),
    );
    toast.success("Mock action: user status updated in UI state");
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
          <CardTitle>User management (UI draft)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by email or name"
            aria-label="Search users"
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
                    <td className="px-2 py-2">{user.name}</td>
                    <td className="px-2 py-2">{user.role}</td>
                    <td className="px-2 py-2">{user.status}</td>
                    <td className="px-2 py-2">{user.lastSignInAt}</td>
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
                          onClick={() => onToggleRole(user.id)}
                        >
                          Toggle role
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onToggleSuspend(user.id)}
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
                    <p className="text-sm text-muted-foreground">{user.name}</p>
                  </div>
                  <div className="text-sm">
                    <p>Role: {user.role}</p>
                    <p>Status: {user.status}</p>
                    <p>Last sign-in: {user.lastSignInAt}</p>
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
                      onClick={() => onToggleRole(user.id)}
                    >
                      Toggle role
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleSuspend(user.id)}
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
            <CardTitle>Reset password (UI draft)</CardTitle>
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
