"use client";

import { LogIn } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { signInWithEmail } from "../actions";

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      <LogIn className="h-4 w-4" />
      {pending ? "Entrando..." : "Entrar na minha agenda"}
    </Button>
  );
}

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [state, formAction] = useFormState(signInWithEmail, {
    message: ""
  });

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="next" value={nextPath} />
      <Field label="E-mail">
        <Input name="email" type="email" required autoComplete="email" />
      </Field>
      <Field label="Senha">
        <Input
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </Field>
      <LoginButton />
      {state.message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
