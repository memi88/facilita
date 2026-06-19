"use client";

import { UserPlus } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { signUpProfessional } from "../actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      <UserPlus className="h-4 w-4" />
      {pending ? "Salvando..." : label}
    </Button>
  );
}

export function SignUpForm() {
  const [state, formAction] = useFormState(signUpProfessional, {
    message: ""
  });

  return (
    <form action={formAction} className="grid gap-4">
      <Field label="Nome">
        <Input name="name" required placeholder="Maria Silva" />
      </Field>
      <Field label="E-mail">
        <Input name="email" type="email" required autoComplete="email" />
      </Field>
      <Field label="Senha">
        <Input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </Field>
      <SubmitButton label="Cadastrar" />
      {state.message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
