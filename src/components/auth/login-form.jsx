"use client";

// UI copied from the Lenzro project's login form (C:\dev\Lenzro, components/forms/login-form.tsx).
// No logic yet: submitting does nothing until Supabase sign-in is wired up.

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GoogleIcon, PasswordInput } from "./password-input";

export function LoginForm({ t, lang }) {
  const f = t.login;
  return (
    <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
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
          <Button type="submit">{f.submit}</Button>
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
