"use client";

import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import type { Profile } from "@/lib/supabase/types";
import { saveCurrentUserProfile } from "../actions";
import { normalizeSlug } from "../utils";

function SaveProfileButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      <Save className="h-4 w-4" />
      {pending ? "Salvando..." : "Salvar perfil"}
    </Button>
  );
}

export function ProfileForm({
  profile,
  email,
  returnTo = "/admin/perfil?tab=perfil"
}: {
  profile: Profile | null;
  email?: string | null;
  returnTo?: string;
}) {
  const [state, formAction] = useFormState(saveCurrentUserProfile, {
    message: ""
  });
  const [publicName, setPublicName] = useState(profile?.public_name ?? "");
  const [slug, setSlug] = useState(profile?.slug ?? "");
  const [calendarEmail, setCalendarEmail] = useState(
    profile?.calendar_email ?? email ?? ""
  );
  const [useAccountEmail, setUseAccountEmail] = useState(
    Boolean(profile?.calendar_email_is_account_email)
  );
  const normalizedSlug = useMemo(
    () => normalizeSlug(slug || publicName),
    [publicName, slug]
  );
  const calendarEmailValue = useAccountEmail ? email ?? "" : calendarEmail;

  return (
    <form action={formAction} className="grid gap-5">
      <input type="hidden" name="returnTo" value={returnTo} />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nome completo">
          <Input
            name="name"
            required
            defaultValue={profile?.name ?? ""}
            placeholder="Maria Silva"
          />
        </Field>
        <Field label="Nome publico da agenda">
          <Input
            name="publicName"
            required
            value={publicName}
            onChange={(event) => setPublicName(event.target.value)}
            placeholder="Dra. Maria Silva"
          />
        </Field>
      </div>

      <Field label="Profissao">
        <Input
          name="profession"
          defaultValue={profile?.profession ?? ""}
          placeholder="Psicologa, professora..."
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <Field label="Link publico">
          <Input
            name="slug"
            required
            value={normalizedSlug}
            onChange={(event) => setSlug(event.target.value)}
          />
        </Field>
        <div className="flex items-end">
          <p className="rounded-2xl border border-border/80 bg-[rgba(37,99,235,0.04)] px-3 py-2 text-sm text-muted-foreground">
            /agendar/{normalizedSlug || "seu-link"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="WhatsApp">
          <Input
            name="phone"
            defaultValue={profile?.phone ?? ""}
            placeholder="+55 11 99999-9999"
          />
        </Field>
        <Field label="E-mail principal da agenda">
          <div className="grid gap-2">
            <Input
              name="calendarEmail"
              type="email"
              value={calendarEmailValue}
              onChange={(event) => {
                setCalendarEmail(event.target.value);
                setUseAccountEmail(false);
              }}
              readOnly={useAccountEmail}
              placeholder="agenda@dominio.com"
            />
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  name="calendarEmailIsAccountEmail"
                  checked={useAccountEmail}
                  onChange={(event) => {
                    setUseAccountEmail(event.target.checked);
                    if (event.target.checked) {
                      setCalendarEmail(email ?? "");
                    }
                  }}
                  className="h-4 w-4 rounded border-border"
                />
                Usar e-mail do cadastro
              </label>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setUseAccountEmail(true);
                  setCalendarEmail(email ?? "");
                }}
              >
                Usar e-mail do cadastro
              </Button>
            </div>
          </div>
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SaveProfileButton />
        {state?.message ? (
          <p className="text-sm text-red-700">{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
