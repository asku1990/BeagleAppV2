"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { authClient } from "@/lib/auth/auth-client";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";

type SignInFormProps = {
  returnTo?: string | string[];
};

type AuthClientError = {
  code?: string;
  message?: string;
};

function normalizeReturnTo(returnTo: string | string[] | undefined): string {
  const value = Array.isArray(returnTo) ? returnTo[0] : returnTo;

  if (!value) {
    return "/admin";
  }

  if (value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/admin";
}

function getSignInErrorKey(
  error: AuthClientError,
): "auth.signIn.errorBanned" | "auth.signIn.errorGeneric" {
  const code = error.code?.toUpperCase();
  const message = error.message?.toLowerCase() ?? "";

  if (
    code === "USER_BANNED" ||
    code === "BANNED" ||
    message.includes("banned from this application")
  ) {
    return "auth.signIn.errorBanned";
  }

  return "auth.signIn.errorGeneric";
}

export function SignInForm({ returnTo }: SignInFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const targetPath = useMemo(() => normalizeReturnTo(returnTo), [returnTo]);

  useEffect(() => {
    if (session?.user) {
      router.replace(targetPath);
    }
  }, [router, session?.user, targetPath]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: `${window.location.origin}${targetPath}`,
      });

      if (error) {
        toast.error(t(getSignInErrorKey(error)));
        return;
      }

      toast.success(t("auth.signIn.success"));
      router.push(targetPath);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Card className={cn(beagleTheme.surface, beagleTheme.border)}>
        <CardHeader>
          <CardTitle>{t("auth.signIn.title")}</CardTitle>
          <CardDescription>{t("auth.signIn.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="email">
                {t("auth.signIn.emailLabel")}
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="password">
                {t("auth.signIn.passwordLabel")}
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t("auth.signIn.submitting")
                : t("auth.signIn.submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
