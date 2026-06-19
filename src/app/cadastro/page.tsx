import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, UserPlus } from "lucide-react";
import { SignUpForm } from "@/features/profiles/components/signup-form";
import { getCurrentUserProfile } from "@/features/profiles/data";
import { AppTopBar, Eyebrow, IconBadge, PageCard, ProgressBar, ShellBackground } from "@/components/ui/scheduler-shell";

export default async function SignUpPage() {
  const profile = await getCurrentUserProfile();

  if (profile) {
    redirect("/admin");
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
            Início
          </Link>
        }
      />

      <main className="px-4 pb-8 pt-4 md:px-8 md:pb-10 md:pt-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4">
            <ProgressBar value={24} />
          </div>

          <section className="grid min-h-[calc(100vh-7.5rem)] overflow-hidden rounded-[1.5rem] border border-border/80 bg-white shadow-soft lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative overflow-hidden border-b border-border/80 bg-[linear-gradient(180deg,rgba(37,99,235,0.08),rgba(255,255,255,0.96))] p-6 md:p-10 lg:border-b-0 lg:border-r">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative flex h-full flex-col justify-between gap-8">
                <div className="max-w-lg">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Início
                  </Link>
                  <div className="mt-10 max-w-md space-y-5">
                    <Eyebrow>Cadastro rápido</Eyebrow>
                    <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
                      Configure a agenda em poucos minutos.
                    </h1>
                    <p className="max-w-md text-lg leading-8 text-muted-foreground">
                      Crie a conta com nome, e-mail e senha. Depois, complete o perfil com
                      e-mail principal, link público e tipos de atendimento.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      title: "Conta pronta",
                      text: "Cadastro simples para começar sem atrito."
                    },
                    {
                      title: "Perfil guiado",
                      text: "Complete as informações quando quiser."
                    },
                    {
                      title: "Agenda organizada",
                      text: "Link público, atendimentos e conexões."
                    }
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-border/70 bg-white/80 p-4">
                      <div className="flex items-center gap-2">
                        <IconBadge icon={CheckCircle2} tone="soft" />
                        <p className="text-sm font-semibold">{item.title}</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center p-6 md:p-10">
              <PageCard className="w-full max-w-xl p-6 md:p-8">
                <div className="mb-6 flex items-start gap-3">
                  <IconBadge icon={UserPlus} />
                  <div>
                    <Eyebrow>Passo 1 de 2</Eyebrow>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                      Cadastrar
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Nome, e-mail e senha. O restante fica para o perfil.
                    </p>
                  </div>
                </div>

                <SignUpForm />

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Já tem conta?{" "}
                  <Link href="/login?next=/admin" className="font-semibold text-primary hover:underline">
                    Entrar
                  </Link>
                </p>
              </PageCard>
            </div>
          </section>
        </div>
      </main>
    </ShellBackground>
  );
}
