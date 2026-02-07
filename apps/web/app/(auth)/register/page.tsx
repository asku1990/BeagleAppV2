"use client";

import { useState } from "react";
import { Button } from "@beagle/ui";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        username: username || undefined,
        password,
      }),
    });

    const payload = (await response.json()) as { ok?: boolean; error?: string };

    if (!response.ok || !payload.ok) {
      setError(payload.error ?? "Registration failed.");
      setIsSubmitting(false);
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
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Register"}
        </Button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </main>
  );
}
