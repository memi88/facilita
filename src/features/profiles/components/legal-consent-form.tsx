"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { CURRENT_LEGAL_CONSENT_VERSION } from "@/lib/legal-consent";
import { acceptLegalConsent } from "../actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Registrando..." : "Aceitar e continuar"}
    </Button>
  );
}

export function LegalConsentForm({ nextPath }: { nextPath: string }) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [state, formAction] = useFormState(acceptLegalConsent, {
    ok: false,
    message: ""
  });

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="next" value={nextPath} />
      <input type="hidden" name="legalConsentVersion" value={CURRENT_LEGAL_CONSENT_VERSION} />
      <label className="flex items-start gap-3 rounded-2xl border border-border bg-[rgba(37,99,235,0.04)] p-4 text-sm leading-6 text-foreground">
        <input
          type="checkbox"
          name="acceptedTerms"
          checked={acceptedTerms}
          onChange={(event) => setAcceptedTerms(event.target.checked)}
          className="mt-1 h-4 w-4 accent-primary"
          required
        />
        <span>
          Li e aceito os{" "}
          <Link href="/termos" className="font-semibold text-primary hover:underline">
            Termos de Serviço
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" className="font-semibold text-primary hover:underline">
            Política de Privacidade
          </Link>{" "}
          da Facilita, versão {CURRENT_LEGAL_CONSENT_VERSION}.
        </span>
      </label>

      <div className="rounded-2xl border border-border bg-white p-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Consentimento versionado</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Se a versão dos termos mudar, você verá esta tela novamente antes de continuar.
            </p>
          </div>
        </div>
      </div>

      <SubmitButton />

      {state.message ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
