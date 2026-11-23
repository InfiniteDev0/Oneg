"use client";

// UI copied from the Lenzro project's signup form (C:\dev\Lenzro, components/forms/signup-form.tsx),
// including its password-strength bars. No logic yet: submitting does nothing
// until Supabase sign-up is wired up.

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GoogleIcon, PasswordInput } from "./password-input";

// Lenzro's 5 checks: length 8+, upper case, lower case, a number, a symbol.
// Labels index: 0 too weak, 1 weak, 2 fair, 3 strong, 4 very strong.
function calcStrength(p) {
  if (!p) return { label: -1, bars: 0 };
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  switch (score) {
    case 5:
      return { label: 4, bars: 4 };
    case 4:
      return { label: 3, bars: 3 };
    case 3:
      return { label: 2, bars: 2 };
    case 2:
      return { label: 1, bars: 1 };
    case 1:
      return { label: 0, bars: 1 };
    default:
      return { label: 0, bars: 0 };
  }
}

const BAR_COLORS = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];

export function SignupForm({ t, lang }) {
  const f = t.signup;
  const [password, setPassword] = useState("");
  const strength = calcStrength(password);

  return (
    <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
      <FieldGroup>
        {/* Header */}
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl">{f.title}</h1>
          <p className="text-sm text-balance text-muted-foreground">{f.subtitle}</p>
        </div>

        {/* Name (optional) */}
        <Field>
          <FieldLabel htmlFor="name" className="text-xs">
            {f.name}
          </FieldLabel>
          <Input id="name" type="text" autoComplete="name" placeholder={f.namePlaceholder} />
        </Field>

        {/* Email */}
        <Field>
          <FieldLabel htmlFor="email" className="text-xs">
            {f.email}
          </FieldLabel>
          <Input id="email" type="email" autoComplete="email" placeholder={f.emailPlaceholder} required />
        </Field>

        {/* Password + strength bars */}
        <Field>
          <FieldLabel htmlFor="password" className="text-xs">
            {f.password}
          </FieldLabel>
          <PasswordInput
            id="password"
            required
            placeholder="******"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showLabel={t.showPassword}
            hideLabel={t.hidePassword}
          />
          {password.length > 0 && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn("h-1 flex-1 rounded", i < strength.bars ? BAR_COLORS[strength.bars - 1] : "bg-zinc-200")}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{t.strength[strength.label]}</p>
            </div>
          )}
        </Field>

        {/* Confirm password */}
        <Field>
          <FieldLabel htmlFor="confirmPassword" className="text-xs">
            {f.confirm}
          </FieldLabel>
          <PasswordInput
            id="confirmPassword"
            required
            placeholder="******"
            autoComplete="new-password"
            showLabel={t.showPassword}
            hideLabel={t.hidePassword}
          />
        </Field>

        {/* Create account button */}
        <Field>
          <Button type="submit">{f.submit}</Button>
        </Field>

        <FieldSeparator className="bg-transparent">{t.or}</FieldSeparator>

        {/* Google */}
        <Field>
          <Button variant="outline" type="button" className="flex items-center gap-2">
            <GoogleIcon />
            {f.google}
          </Button>

          <FieldDescription className="text-center">
            {f.haveAccount}{" "}
            <Link
              href={`/${lang}/auth`}
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
