"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRegister } from "@/lib/hooks/use-auth";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const register = useRegister();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      await register.mutateAsync({
        email,
        username: username || undefined,
        password,
      });
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Registration failed.";
      setError(message);
      return;
    }

    window.location.href = "/login";
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="rounded border p-2"
        />
        <input
          name="username"
          type="text"
          placeholder="Username (optional)"
          className="rounded border p-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="rounded border p-2"
        />
        <Button type="submit" disabled={register.isPending}>
          {register.isPending ? "Creating..." : "Register"}
        </Button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </main>
  );
}
