import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { PublicFooter } from "@/components/ui/public-footer";
import { AppTopBar, Eyebrow, PageCard, ShellBackground } from "@/components/ui/scheduler-shell";
import { LegalConsentForm } from "@/features/profiles/components/legal-consent-form";
import { getCurrentUserProfile } from "@/features/profiles/data";
import { needsLegalConsent } from "@/lib/legal-consent";

export const metadata: Metadata = {
  title: "Consentimento — Facilita",
  description:
    "Confirme os Termos de Serviço e a Política de Privacidade antes de continuar usando a Facilita."
};

function getSafeNextPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/admin";
  }

  return value;
}

export default async function ConsentimentoPage({
  searchParams
}: {
  searchParams: { next?: string };
}) {
  const nextPath = getSafeNextPath(searchParams.next);
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login?next=/consentimento");
  }

  if (!needsLegalConsent(profile)) {
    redirect(nextPath);
  }

  return (
    <ShellBackground>
      <AppTopBar
        actions={
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        }
      />

      <main className="px-4 pb-8 pt-4 md:px-8 md:pb-10 md:pt-6">
        <div className="mx-auto max-w-[1360px]">
          <section className="grid min-h-[calc(100vh-7.5rem)] overflow-hidden rounded-[1.5rem] border border-border/80 bg-white shadow-soft lg:grid-cols-[0.92fr_1.08fr]">
            <div className="relative overflow-hidden border-b border-border/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(37,99,235,0.75))] p-6 text-white md:p-10 lg:border-b-0 lg:border-r">
              <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
              <div className="relative flex h-full flex-col justify-between gap-8">
                <div className="max-w-md">
                  <Eyebrow>Consentimento</Eyebrow>
                  <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
                    Atualizamos nossos termos.
                  </h1>
                  <p className="mt-4 max-w-md text-lg leading-8 text-white/75">
                    Antes de continuar, confirme a versão atual dos Termos de Serviço e da Política
                    de Privacidade.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-white/80">
                  A sua confirmação fica gravada com a versão atual do consentimento.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center p-6 md:p-10">
              <PageCard className="w-full max-w-lg p-6 md:p-8">
                <div className="mb-6 flex items-start gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <Eyebrow>Leia e confirme</Eyebrow>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                      Termos e privacidade
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Essa confirmação é obrigatória para seguir usando a plataforma.
                    </p>
                  </div>
                </div>

                <LegalConsentForm nextPath={nextPath} />
              </PageCard>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </ShellBackground>
  );
}
