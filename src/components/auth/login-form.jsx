"use client";

// UI copied from the Lenzro project's login form (C:\dev\Lenzro, components/forms/login-form.tsx).
// Until Supabase sign-in is wired up, only the demo account logs in (lib/demo-account.js).
// Logging in is one gooey toast that changes as it resolves, as Barista's
// (features/auth/authToasts.tsx): "Signing you in…" becomes "Welcome back" and the
// app opens, or "Wrong email or password" with Try again.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gooeyToast } from "goey-toast";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { DEMO_ACCOUNT, startDemoSession } from "@/lib/demo-account";
import { GoogleIcon, PasswordInput } from "./password-input";

const READ_MS = 6000; // Barista's: long enough to read two lines without rushing
const CHECK_MS = 900; // the moment the details take to check, so "Signing you in…" is seen

export function LoginForm({ t, lang }) {
  const f = t.login;
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (busy) return;
    const form = e.currentTarget;
    const email = form.elements.email.value.trim().toLowerCase();
    const password = form.elements.password.value;
    const ok = email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password;
    setBusy(true);

    const attempt = new Promise((resolve, reject) =>
      window.setTimeout(() => (ok ? resolve() : reject(new Error("wrong"))), CHECK_MS)
    );
    gooeyToast.promise(attempt, {
      loading: f.toast.loading,
      success: f.toast.success,
      error: f.toast.error,
      description: { loading: f.toast.loadingBody, success: f.toast.successBody, error: f.toast.errorBody },
      action: {
        error: {
          label: f.toast.retry,
          onClick: () => {
            form.elements.password.focus();
            form.elements.password.select();
          },
        },
      },
      timing: { displayDuration: READ_MS },
    });
    attempt.then(
      () => {
        startDemoSession();
        router.push(`/${lang}/app`);
      },
      () => setBusy(false)
    );
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={submit}>
      <FieldGroup>
        {/* Header */}
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl">{f.title}</h1>
          <p className="text-sm text-balance text-muted-foreground">{f.subtitle}</p>
        </div>

        {/* Email */}
        <Field>
          <FieldLabel htmlFor="email" className="text-xs">
            {f.email}
          </FieldLabel>
          <Input id="email" type="email" autoComplete="email" placeholder={f.emailPlaceholder} required />
        </Field>

        {/* Password */}
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password" className="text-xs">
              {f.password}
            </FieldLabel>
            <Link href="#" className="ms-auto text-xs underline-offset-4 hover:underline">
              {f.forgot}
            </Link>
          </div>
          <PasswordInput
            id="password"
            required
            placeholder="******"
            autoComplete="current-password"
            showLabel={t.showPassword}
            hideLabel={t.hidePassword}
          />
        </Field>

        {/* Login button */}
        <Field>
          <Button type="submit" disabled={busy}>
            {f.submit}
          </Button>
        </Field>

        {/* Separator */}
        <FieldSeparator className="bg-transparent">{t.or}</FieldSeparator>

        {/* Google */}
        <Field>
          <Button variant="outline" type="button" className="flex items-center gap-2">
            <GoogleIcon />
            {f.google}
          </Button>

          <FieldDescription className="text-center">
            {f.noAccount}{" "}
            <Link
              href={`/${lang}/auth?mode=signup`}
              scroll={false}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {f.switch}
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
