"use client";

import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { signUpProfessional } from "../actions";
import { normalizeSlug } from "../utils";

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
  const [publicName, setPublicName] = useState("");
  const [slug, setSlug] = useState("");
  const suggestedSlug = useMemo(
    () => normalizeSlug(slug || publicName),
    [publicName, slug]
  );

  return (
    <form action={formAction} className="grid gap-4">
      <Field label="Nome completo">
        <Input name="name" required placeholder="Maria Silva" />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
      <Field label="Nome que aparece na agenda">
          <Input
            name="publicName"
            required
            placeholder="Dra. Maria Silva"
            value={publicName}
            onChange={(event) => setPublicName(event.target.value)}
          />
        </Field>
        <Field label="Profissao">
          <Input name="profession" placeholder="Psicologa, professora..." />
        </Field>
      </div>
      <Field label="Link publico">
        <Input
          name="slug"
          required
          value={suggestedSlug}
          onChange={(event) => setSlug(event.target.value)}
        />
      </Field>
      <p className="-mt-2 text-xs text-muted-foreground">
        Seu link sera /agendar/{suggestedSlug || "seu-link"}
      </p>
      <Field label="WhatsApp">
        <Input name="phone" placeholder="+55 11 99999-9999" />
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
      <Field label="E-mail do calendario">
        <Input name="calendarEmail" type="email" placeholder="opcional por enquanto" />
      </Field>
      <SubmitButton label="Criar minha agenda" />
      {state.message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
