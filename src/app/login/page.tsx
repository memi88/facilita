import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AppTopBar, Eyebrow, IconBadge, PageCard, ProgressBar, ShellBackground } from "@/components/ui/scheduler-shell";

function getSafeNextPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }

  return value;
}

export default async function LoginPage({
  searchParams
}: {
  searchParams: { next?: string };
}) {
  const nextPath = getSafeNextPath(searchParams.next);
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
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
            Início
          </Link>
        }
      />

      <main className="px-4 pb-8 pt-4 md:px-8 md:pb-10 md:pt-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4">
            <ProgressBar value={68} />
          </div>

          <section className="grid min-h-[calc(100vh-7.5rem)] overflow-hidden rounded-[1.5rem] border border-border/80 bg-white shadow-soft lg:grid-cols-[0.92fr_1.08fr]">
            <div className="relative overflow-hidden border-b border-border/80 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(37,99,235,0.75))] p-6 text-white md:p-10 lg:border-b-0 lg:border-r">
              <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
              <div className="relative flex h-full flex-col justify-between gap-8">
                <div className="max-w-md">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-white/75 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Início
                  </Link>
                  <div className="mt-10 space-y-5">
                    <Eyebrow>Portal do profissional</Eyebrow>
                    <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                      Sua agenda organizada, sem ruído.
                    </h1>
                    <p className="max-w-md text-lg leading-8 text-white/75">
                      Acompanhe pedidos de horário, ajuste a disponibilidade e mantenha
                      tudo pronto para compartilhar.
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 text-sm text-white/80">
                  {[
                    "Pedidos pendentes em destaque",
                    "Link público simples para compartilhar",
                    "Disponibilidade organizada em poucos passos"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                      <ShieldCheck className="h-4 w-4 text-white/80" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center p-6 md:p-10">
              <PageCard className="w-full max-w-md p-6 md:p-8">
                <div className="mb-6 flex items-start gap-3">
                  <IconBadge icon={LockKeyhole} />
                  <div>
                    <Eyebrow>Entrar</Eyebrow>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                      Entrar na Facilita
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Entre com e-mail e senha da sua conta.
                    </p>
                  </div>
                </div>

                <LoginForm nextPath={nextPath} />

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Ainda não tem conta?{" "}
                  <Link href="/cadastro" className="font-semibold text-primary hover:underline">
                    Cadastrar
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
