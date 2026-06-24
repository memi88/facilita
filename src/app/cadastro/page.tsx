import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { SignUpForm } from "@/features/profiles/components/signup-form";
import { getCurrentUserProfile } from "@/features/profiles/data";
import { BrandLogo } from "@/components/ui/brand-logo";
import { PageCard } from "@/components/ui/scheduler-shell";
import { PublicFooter } from "@/components/ui/public-footer";
import { getLegalConsentRedirectPath, needsLegalConsent } from "@/lib/legal-consent";

export default async function SignUpPage() {
  const profile = await getCurrentUserProfile();

  if (profile) {
    if (needsLegalConsent(profile)) {
      redirect(getLegalConsentRedirectPath("/admin"));
    }

    redirect("/admin");
  }

  return (
    <div className="min-h-screen">
      <div className="fixed left-0 top-0 z-50 h-1 w-full bg-[rgba(37,99,235,0.12)]">
        <div className="h-full w-[33%] bg-primary" />
      </div>

      <header className="mx-auto flex max-w-[1360px] items-center justify-between px-4 py-6 md:px-10">
        <Link href="/" className="shrink-0">
          <BrandLogo />
        </Link>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium text-secondary transition hover:text-primary"
        >
          Precisa de ajuda?
          <Sparkles className="h-5 w-5" />
        </button>
      </header>

      <main className="mx-auto flex max-w-[1360px] items-center px-4 pb-12 pt-8 md:px-10">
        <div className="grid w-full gap-6 md:grid-cols-[0.82fr_1.18fr]">
          <div className="hidden gap-4 md:flex md:flex-col">
            <PageCard className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-semibold tracking-tight">
                Segurança Garantida
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Seus dados e os de seus clientes são protegidos por criptografia e boas práticas
                de acesso.
              </p>
            </PageCard>

            <PageCard className="overflow-hidden bg-primary p-6 text-primary-foreground">
              <div className="relative">
                <h2 className="text-xl font-semibold tracking-tight">Conectividade</h2>
                <p className="mt-3 text-sm leading-7 text-white/90">
                  Sincronize com Google Calendar e reduza conflitos de horários antes mesmo de
                  começar.
                </p>
                <CheckCircle2 className="absolute -bottom-2 -right-2 h-24 w-24 text-white/10" />
              </div>
            </PageCard>
          </div>

          <section className="rounded-[1.5rem] border border-border bg-white p-6 shadow-soft md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Passo 1 de 3
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-[56px] md:leading-[1.05]">
              Vamos começar pelo básico
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Como você gostaria que seus clientes te vissem?
            </p>

            <div className="mt-8 max-w-2xl">
              <SignUpForm />
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
